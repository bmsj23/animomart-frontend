import { useState, useEffect } from 'react';

const CustomerInfoForm = ({ form, handleChange, showAllErrors = false, validateSignal = null }) => {
  // errors store validation messages; touched controls whether to show them
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // validators (simple and readable)
  const validators = {
    name: (v) => {
      if (!v || String(v).trim().length < 3) return 'Please enter your full name (min 3 characters).';
      return '';
    },
    email: (v) => {
      if (!v) return 'Email is required.';
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(v) ? '' : 'Please enter a valid email address.';
    },
    phone: (v) => {
      if (!v) return 'Phone number is required.';
      const digits = String(v).replace(/\D/g, '');
      return digits.length >= 7 ? '' : 'Please enter a valid phone number.';
    }
  };

  // validate a field value and update errors map
  const validateField = (name, value) => {
    const validator = validators[name];
    const message = validator ? validator(value) : '';
    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === '';
  };

  // handle input: keep parent form state in sync and validate as user types
  const handleInput = (e) => {
    const { name, value } = e.target;
    handleChange(e);
    // mark touched on first input so we show validation while typing
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // handle blur: mark touched and validate
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // on mount, run validators silently (do not show errors until user interacts)
  useEffect(() => {
    Object.keys(validators).forEach((key) => {
      validateField(key, form[key]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if parent requests showing all errors (on submit), mark all fields touched
  useEffect(() => {
    if (showAllErrors) {
      const allTouched = Object.keys(validators).reduce((acc, k) => ({ ...acc, [k]: true }), {});
      setTouched(allTouched);
      // validate all so errors appear
      Object.keys(validators).forEach((key) => validateField(key, form[key]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllErrors]);

  // also listen for parent trigger (validateSignal) which indicates the user entered another section
  useEffect(() => {
    if (validateSignal == null) return;
    // mark fields touched and validate so errors appear on blur/navigation
    const allTouched = Object.keys(validators).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    Object.keys(validators).forEach((key) => validateField(key, form[key]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateSignal]);

  // helper to build className and whether to show error
  const showError = (field) => touched[field] && errors[field];
  const inputClass = (field) =>
    `mt-1 block w-full rounded-md px-3 py-2 focus:ring-2 ${showError(field) ? 'border-red-500 ring-red-100 border' : 'border border-gray-200 focus:ring-green-500 focus:border-transparent'}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Customer Information</h2>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleInput}
            onBlur={handleBlur}
            required
            aria-invalid={Boolean(showError('name'))}
            aria-describedby={showError('name') ? 'name-error' : undefined}
            className={inputClass('name')}
          />
          {showError('name') && <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleInput}
            onBlur={handleBlur}
            required
            aria-invalid={Boolean(showError('email'))}
            aria-describedby={showError('email') ? 'email-error' : undefined}
            className={inputClass('email')}
          />
          {showError('email') && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleInput}
            onBlur={handleBlur}
            required
            placeholder="09123456789"
            aria-invalid={Boolean(showError('phone'))}
            aria-describedby={showError('phone') ? 'phone-error' : undefined}
            className={inputClass('phone')}
          />
          {showError('phone') && <p id="phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </form>
    </div>
  );
};

export default CustomerInfoForm;