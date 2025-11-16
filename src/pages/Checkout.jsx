import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CustomerInfoForm from '../components/checkout/CustomerInfoForm';
import DeliveryMethodSection from '../components/checkout/DeliveryMethodSection';
import PaymentMethodSection from '../components/checkout/PaymentMethodSection';
import OrderSummary from '../components/checkout/OrderSummary';
import useCheckout from '../hooks/useCheckout';

const Checkout = () => {
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showAllErrors, setShowAllErrors] = useState(false);
  // signal to tell CustomerInfoForm to reveal errors for step-based validation
  const [customerValidateSignal, setCustomerValidateSignal] = useState(null);
  // signal to tell DeliveryMethodSection to reveal errors when proceeding to payment
  const [deliveryValidateSignal, setDeliveryValidateSignal] = useState(null);

  const deliveryRef = useRef(null);
  const paymentRef = useRef(null);

  const {
    form,
    setForm,
    handleChange,
    sellerGroups,
    subtotal,
    shippingFee,
    total,
    isProcessing,
    handleSubmitOrder,
    cartLoading
  } = useCheckout();

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    navigate('/cart');
  };

  // Observe when the user scrolls the delivery/payment sections into view
  // and trigger validation for the previous step. This makes validation
  // step-based: errors for CustomerInfo show when user enters Delivery,
  // and errors for Delivery show when user enters Payment.
  useEffect(() => {
    if (!deliveryRef.current || !paymentRef.current) return;

    const options = { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0 };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        // require a small scroll to avoid firing on initial mount
        const scrolled = (window.scrollY || window.pageYOffset) > 20;
        if (!scrolled) return;
        if (entry.target === deliveryRef.current) {
          // user scrolled into Delivery -> validate CustomerInfo
          setCustomerValidateSignal(s => (s ?? 0) + 1);
        }
        if (entry.target === paymentRef.current) {
          // user scrolled into Payment -> validate Delivery
          setDeliveryValidateSignal(s => (s ?? 0) + 1);
        }
      });
    }, options);

    obs.observe(deliveryRef.current);
    obs.observe(paymentRef.current);

    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* left column - forms */}
        <div className="space-y-6">
          <div ref={deliveryRef}>
            <CustomerInfoForm
              form={form}
              handleChange={handleChange}
              showAllErrors={showAllErrors}
              validateSignal={customerValidateSignal}
            />

            <DeliveryMethodSection
              form={form}
              setForm={setForm}
              handleChange={handleChange}
              showAllErrors={showAllErrors}
              validateSignal={deliveryValidateSignal}
              onSectionEnter={() => setCustomerValidateSignal(s => (s ?? 0) + 1)}
            />
          </div>

          <div ref={paymentRef}>
            <PaymentMethodSection
              form={form}
              setForm={setForm}
              deliveryMethod={form.deliveryMethod}
              onSectionEnter={() => {
                // when user interacts with Payment, validate Delivery and Customer
                setDeliveryValidateSignal(s => (s ?? 0) + 1);
                setCustomerValidateSignal(s => (s ?? 0) + 1);
              }}
            />
          </div>
        </div>

        {/* right column - order summary */}
          <OrderSummary
            sellerGroups={sellerGroups}
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={total}
            isProcessing={isProcessing}
            onSubmit={async () => {
              // mark fields to show errors, then call submit (which will show toast)
              setShowAllErrors(true);
              await handleSubmitOrder();
            }}
            onCancel={() => setShowCancelConfirm(true)}
          />
      </div>

      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="cancel checkout">
        <p>Are you sure you want to cancel the checkout? Your form will be cleared.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setShowCancelConfirm(false)}
            className="px-4 py-2 border rounded-md hover:cursor-pointer"
          >
            No, Continue
          </button>
          <button
            onClick={handleConfirmCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:cursor-pointer"
          >
            Yes, Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;