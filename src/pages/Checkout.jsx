import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CustomerInfoForm from '../components/checkout/CustomerInfoForm';
import DeliveryMethodSection from '../components/checkout/DeliveryMethodSection';
import PaymentMethodSection from '../components/checkout/PaymentMethodSection';
import OrderSummary from '../components/checkout/OrderSummary';
import useCheckout from '../hooks/useCheckout';
import { logger } from '../utils/logger';

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

  // ensure we land at the top when opening the checkout page
  // (prevents leftover scroll from previous page making fields show validation)
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (e) {
      logger.log(e);
      window.scrollTo(0, 0);
    }
  }, []);

  // Observe when the user scrolls the delivery/payment sections into view
  // We no longer use IntersectionObserver to trigger validation on passive scroll.
  // Instead, the child sections (Delivery/Payment) call `onSectionEnter` when
  // the user performs an explicit action (click/select/change) inside the section.

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
          <CustomerInfoForm
            form={form}
            handleChange={handleChange}
            showAllErrors={showAllErrors}
            validateSignal={customerValidateSignal}
          />

          <div ref={deliveryRef}>
            <DeliveryMethodSection
              form={form}
              setForm={setForm}
              handleChange={handleChange}
              showAllErrors={showAllErrors}
              validateSignal={deliveryValidateSignal}
              onSectionEnter={() => setCustomerValidateSignal(s => (s ?? 0) + 1)}
              cartItems={sellerGroups}
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

      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Cancel Checkout">
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