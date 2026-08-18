import 'lite-youtube-embed';
import BasePage from './base-page';
import Fslightbox from 'fslightbox';
window.fslightbox = Fslightbox;
import { zoom } from './partials/image-zoom';

class Product extends BasePage {
    onReady() {
        app.watchElements({
            totalPrice: '.total-price',
            productWeight: '.product-weight',
            beforePrice: '.before-price',
            startingPriceTitle: '.starting-price-title',
            productSku: '.product-sku',
        });

        this._pendingFreeOptions      = null;
        this._pendingOfferFreeOptions = null; // [{ productId, options: {id:val} }, ...]

        this.initProductOptionValidations();

        if(imageZoom){
            this.initImagesZooming();
            window.addEventListener('resize', () => this.initImagesZooming());
        }

        // Gate: intercept Quick Buy / Apple Pay before cart creation.
        //
        // Priority order:
        //  1. If the product (X) triggers one or more Buy X Get Y offers where each
        //     free product (Y) has required advance=0 options → show one modal step
        //     per Y (sequential), collecting options before the cart request fires.
        //  2. If X itself has required advance=0 options:
        //     PDP page   → validate in-place via salla-product-options on page.
        //     Non-PDP    → show X's options in the modal (options from the API).
        salla.hooks.on('salla-add-product-button', 'validate', async (ctx) => {
          let resp;
          try {
            resp = await salla.product.api.getOptions([{ id: ctx.productId, quantity: ctx.quantity ?? 1 }]);
          } catch {
            return ctx;
          }

          const offerOptionsList = resp?.data?.advance_free_product ?? [];
          const freeOptions      = resp?.data?.options ?? [];
          const product          = resp?.data?.products?.[0];

          // Priority 1: one or more free offer products have required options.
          if (offerOptionsList.length) {
            return this._handleOfferFreeOptionsSteps(ctx, offerOptionsList);
          }

          // Priority 2: product X has its own free options.
          const pdpOptionsEl = document.querySelector(`salla-product-options[product-id="${ctx.productId}"]`);

          if (pdpOptionsEl && freeOptions.length) {
            return this._handlePdpFreeOptions(ctx, pdpOptionsEl);
          }

          if (!pdpOptionsEl && freeOptions.length) {
            return this._openOptionsModal(ctx, freeOptions, product);
          }

          return ctx;
        });
    }

    // Show one modal step per offer product (Y), in sequence.
    // Collects { productId, options } for each Y that has selections.
    async _handleOfferFreeOptionsSteps(ctx, offerOptionsList) {
      const modal = document.querySelector('salla-order-options-modal');
      if (!modal) return ctx;

      const pending = [];

      for (const offerOptions of offerOptionsList) {
        let result;
        try {
          result = await modal.open({
            orderOptions : offerOptions.options,
            basePrice    : offerOptions.product?.price?.amount ?? 0,
            paymentMode  : ctx.paymentMode ?? 'default',
            product      : offerOptions.product,
          });
        } catch {
          throw new Error('offer_free_options_modal_dismissed');
        }

        const selected = {};
        (result?.orderOptions ?? []).forEach(({ id, value }) => { selected[id] = value; });

        if (Object.keys(selected).length) {
          pending.push({ productId: offerOptions.product?.id, options: selected });
        }
      }

      if (pending.length) {
        this._pendingOfferFreeOptions = pending;
      }

      return ctx;
    }

    // PDP page: salla-product-options element is on the page — validate in-place.
    async _handlePdpFreeOptions(ctx, optionsEl) {
      const selected    = await optionsEl.getSelectedOptions?.() ?? {};
      const allOptions  = optionsEl.optionsData ?? [];
      const freeOptions = allOptions.filter(o => !o.is_advance);

      const missingRequired = freeOptions.filter(o => o.required && !selected[o.id]);
      if (missingRequired.length) {
        optionsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        salla.notify.error(salla.lang.get('pages.products.required_free_options_message'));
        throw new Error('required_free_options_missing');
      }

      const selectedFree = {};
      freeOptions.forEach(o => {
        if (selected[o.id] !== undefined) selectedFree[o.id] = selected[o.id];
      });
      if (Object.keys(selectedFree).length) {
        this._pendingFreeOptions = selectedFree;
      }

      const hasUnfilledOptional = freeOptions.some(o => !o.required && !selected[o.id]);
      if (hasUnfilledOptional) {
        optionsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        salla.notify.info(salla.lang.get('pages.products.optional_options_hint'));
      }

      return ctx;
    }

    // Non-PDP: open the modal for X's own free options.
    async _openOptionsModal(ctx, freeOptions, product) {
      const modal = document.querySelector('salla-order-options-modal');
      if (!modal) return ctx;

      let result;
      try {
        result = await modal.open({
          orderOptions : freeOptions,
          basePrice    : product?.price?.amount ?? 0,
          paymentMode  : ctx.paymentMode ?? 'default',
          product      : product,
        });
      } catch {
        throw new Error('free_options_modal_dismissed');
      }

      const selected = {};
      (result?.orderOptions ?? []).forEach(({ id, value }) => { selected[id] = value; });
      if (Object.keys(selected).length) {
        this._pendingFreeOptions = selected;
      }

      return ctx;
    }

    initImagesZooming() {
      const imageZoom = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass');
      if (window.innerWidth  < 1024 || imageZoom) return;
      setTimeout(() => {
          const image = document.querySelector('.image-slider .swiper-slide-active img');
          zoom(image?.id, 2);
      }, 250);

      document.querySelector('salla-slider.details-slider').addEventListener('slideChange', (e) => {
          setTimeout(() => {
              const imageZoom = document.querySelector('.image-slider .swiper-slide-active .img-magnifier-glass');
              if (window.innerWidth  < 1024 || imageZoom) return;
              const image = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active img');
              zoom(image?.id, 2);
          }, 250)
      })
    }

    registerEvents() {
      // Inject X's own free options into the cart request.
      salla.event.on('cart::before.add.item', (eventData) => {
        if (!this._pendingFreeOptions) return;
        const options = this._pendingFreeOptions;
        this._pendingFreeOptions = null;
        eventData.payload?.set?.('options', options);
      });

      // Inject all free offer products (Y₁, Y₂, …) as explicit products in the
      // cart request so the backend adds each with the shopper-selected options.
      //
      // Converts: id=X&quantity=N
      // Into:     products[0][id]=X&products[0][quantity]=N
      //           products[1][id]=Y1&products[1][options][o1]=v1
      //           products[2][id]=Y2&products[2][options][o2]=v2  …
      //
      // MiniCheckoutRequest::prepareForValidation() expands bracket-notation keys
      // into nested arrays before validation, so the backend receives a clean
      // products[] structure it can iterate with addListOfProductsWithOptions().
      salla.event.on('cart::before.add.item', (eventData) => {
        if (!this._pendingOfferFreeOptions) return;
        const pending = this._pendingOfferFreeOptions;
        this._pendingOfferFreeOptions = null;

        // Promote X from the flat id/quantity format to products[0].
        const xId  = eventData.payload?.get?.('id');
        const xQty = eventData.payload?.get?.('quantity') || '1';
        if (xId) {
          eventData.payload?.delete?.('id');
          eventData.payload?.delete?.('quantity');
          eventData.payload?.set?.('products[0][id]', String(xId));
          eventData.payload?.set?.('products[0][quantity]', String(xQty));
        }

        // Append each Y as the next slot in the products array.
        pending.forEach(({ productId, options }, i) => {
          const slot = xId ? i + 1 : i;
          eventData.payload?.set?.(`products[${slot}][id]`, String(productId));
          eventData.payload?.set?.(`products[${slot}][quantity]`, '1');
          Object.entries(options).forEach(([optId, val]) => {
            eventData.payload?.set?.(`products[${slot}][options][${optId}]`, String(val));
          });
        });
      });

      salla.event.on('product::price.updated.failed',()=>{
        app.element('.price-wrapper').classList.add('hidden');
        const outOfStock = app.element('.out-of-stock');
        outOfStock.classList.remove('hidden');
        outOfStock.classList.remove('scale-pulse');
        void outOfStock.offsetWidth;
        outOfStock.classList.add('scale-pulse');
      })
      salla.product.event.onPriceUpdated((res) => {

        app.element('.out-of-stock').classList.add('hidden')
        app.element('.price-wrapper').classList.remove('hidden')

        let data = res.data,
            is_on_sale = data.has_sale_price && data.regular_price > data.price;

        app.startingPriceTitle?.classList.add('hidden');

        app.productWeight.forEach((el) => {el.innerHTML = data.weight || ''});
        app.totalPrice.forEach((el) => {el.innerHTML = salla.money(data.price)});
        app.beforePrice.forEach((el) => {el.innerHTML = salla.money(data.regular_price)});
        app.productSku.forEach((el) => {el.innerHTML = data.sku || ''});

        app.toggleClassIf('.price_is_on_sale','showed','hidden', ()=> is_on_sale)
        app.toggleClassIf('.starting-or-normal-price','hidden','showed', ()=> is_on_sale)

        document.querySelectorAll('.total-price, .product-weight').forEach(el => {
          el.classList.remove('scale-pulse');
          void el.offsetWidth;
          el.classList.add('scale-pulse');
        });
      });

      app.onClick('#btn-show-more', e => app.all('#more-content', div => {
        e.target.classList.add('is-expanded');
        div.style = `max-height:${div.scrollHeight}px`;
      }) || e.target.remove());
    }
}

Product.initiateWhenReady(['product.single']);
