import React from 'react';

interface Plan {
  name: string;
  price: number;
  duration: string;
}

const plans: Plan[] = [
  {
    name: 'Monthly',
    price: 200,
    duration: '1 month',
  },
  {
    name: '3 Months',
    price: 550,
    duration: '3 months',
  },
  {
    name: 'Yearly',
    price: 2000,
    duration: '1 year',
  },
];

interface SubscriptionPlansProps {
  onSelectPlan: (plan: Plan) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
      {plans.map((plan) => (
        <div key={plan.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 bg-purple-600 text-white text-center">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <div className="mt-4 flex items-center justify-center">
              <span className="text-4xl font-bold">₹{plan.price}</span>
              <span className="ml-2 text-purple-200">/{plan.duration}</span>
            </div>
          </div>
          <div className="px-6 py-8">
            <button
              onClick={() => onSelectPlan(plan)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
            >
              Select Plan
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
