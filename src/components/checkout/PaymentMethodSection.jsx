import { Banknote } from 'lucide-react';
import GCash from '/assets/payments/gcash.png';
import Maya from '/assets/payments/maya.jpg';

const paymentMethods = [
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    icon: Banknote,
    iconType: 'lucide',
    description: 'Pay with cash when your order arrives',
    availableFor: 'shipping'
  },
  {
    id: 'cash_on_meetup',
    name: 'Cash on Meetup',
    icon: Banknote,
    iconType: 'lucide',
    description: 'Pay with cash during meetup',
    availableFor: 'meetup'
  },
  {
    id: 'mock_gcash',
    name: 'GCash (Mock)',
    icon: GCash,
    iconType: 'image',
    description: 'Pay via GCash e-wallet (simulated)',
    availableFor: 'both'
  },
  {
    id: 'mock_paymaya',
    name: 'Maya (Mock)',
    icon: Maya,
    iconType: 'image',
    description: 'Pay via Maya e-wallet (simulated)',
    availableFor: 'both'
  }
];

const PaymentMethodSection = ({ form, setForm, deliveryMethod }) => {
  const availableMethods = paymentMethods.filter(method => {
    if (method.availableFor === 'both') return true;
    if (method.availableFor === 'shipping' && deliveryMethod === 'shipping') return true;
    if (method.availableFor === 'meetup' && deliveryMethod === 'meetup') return true;
    return false;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

      <div className="space-y-3">
        {availableMethods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, paymentMethod: method.id }))}
              className={`w-full p-4 border-2 rounded-lg transition-all text-left hover:cursor-pointer ${
                form.paymentMethod === method.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {method.iconType === 'image' ? (
                  <img src={method.icon} alt={method.name} className="w-6 h-6 object-contain" />
                ) : (
                  <Icon className="w-6 h-6 text-green-600" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-xs text-gray-500">{method.description}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  form.paymentMethod === method.id
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}>
                  {form.paymentMethod === method.id && (
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSection;