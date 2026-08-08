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

        this._pendingFreeOptions = null;

        this.initProductOptionValidations();

        if(imageZoom){
            // call the function when the page is ready
            this.initImagesZooming();
            // listen to screen resizing
            window.addEventListener('resize', () => this.initImagesZooming());
        }
    }

    initProductOptionValidations() {
      document.querySelector('.product-form')?.addEventListener('change', function(){
        // reportValidity() natively focuses/scrolls to the first empty required option mid-edit; read validity instead
        const isComplete = Array.from(this.elements).every(el => el.validity.valid);
        isComplete && salla.product.getPrice(new FormData(this));
      });

      // Gate: intercept Quick Buy / Apple Pay before cart creation to enforce free
      // (advance=0) product options. Two paths:
      //  1. PDP — salla-product-options is on the page: validate in-place, block + scroll
      //     when required options are missing, inject selections via cart::before.add.item.
      //  2. Non-PDP (product card / mini-cart) — call product/options API; if the product
      //     has free options, open salla-order-options-modal (same as CHOD-11650) with the
      //     free options as steps, then inject selections the same way.
      salla.hooks.on('salla-add-product-button', 'validate', async (ctx) => {
        const pdpOptionsEl = document.querySelector(`salla-product-options[product-id="${ctx.productId}"]`);

        if (pdpOptionsEl) {
          return this._handlePdpFreeOptions(ctx, pdpOptionsEl);
        }

        return this._handleModalFreeOptions(ctx);
      });
    }

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

      // Soft hint for optional unfilled free options (non-blocking).
      const hasUnfilledOptional = freeOptions.some(o => !o.required && !selected[o.id]);
      if (hasUnfilledOptional) {
        optionsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        salla.notify.info(salla.lang.get('pages.products.optional_options_hint'));
      }

      return ctx;
    }

    async _handleModalFreeOptions(ctx) {
      let resp;
      try {
        resp = await salla.product.api.getOptions([{ id: ctx.productId, quantity: ctx.quantity ?? 1 }]);
      } catch {
        return ctx;
      }

      const freeOptions = resp?.data?.options ?? [];
      const product     = resp?.data?.products?.[0];

      if (!freeOptions.length) return ctx;

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
      // skip if the screen is not desktop or if glass magnifier
      // is already crated for the image before
      const imageZoom = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass');
      if (window.innerWidth  < 1024 || imageZoom) return;
      setTimeout(() => {
          // set delay after the resizing is done, start creating the glass
          // to create the glass in the proper position
          const image = document.querySelector('.image-slider .swiper-slide-active img');
          zoom(image?.id, 2);
      }, 250);


      document.querySelector('salla-slider.details-slider').addEventListener('slideChange', (e) => {
          // set delay till the active class is ready
          setTimeout(() => {
              const imageZoom = document.querySelector('.image-slider .swiper-slide-active .img-magnifier-glass');

              // if the zoom glass is already created skip
              if (window.innerWidth  < 1024 || imageZoom) return;
              const image = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active img');
              zoom(image?.id, 2);
          }, 250)
      })
    }

    registerEvents() {
      // Inject free product options collected by the gate into the cart request.
      // Mirrors how CHOD-11650 injects order_options via cart::before.add.item.
      salla.event.on('cart::before.add.item', (eventData) => {
        if (!this._pendingFreeOptions) return;
        const options = this._pendingFreeOptions;
        this._pendingFreeOptions = null;
        eventData.payload?.set?.('options', options);
      });

      salla.event.on('product::price.updated.failed',()=>{
        app.element('.price-wrapper').classList.add('hidden');
        const outOfStock = app.element('.out-of-stock');
        outOfStock.classList.remove('hidden');
        outOfStock.classList.remove('scale-pulse');
        void outOfStock.offsetWidth; // trigger reflow
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
          void el.offsetWidth; // trigger reflow
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
