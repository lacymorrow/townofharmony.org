export const rateLimits = {
	contactForm: {
		requests: 3,
		duration: 60 * 60, // 1 hour
	},
	api: {
		default: {
			requests: 100,
			duration: 60,
		},
		auth: {
			requests: 10,
			duration: 60 * 5,
		},
	},
	web: {
		default: {
			requests: 50,
			duration: 60,
		},
		forms: {
			requests: 20,
			duration: 60 * 2,
		},
	},
	importPayments: {
		requests: 5,
		duration: 60 * 30,
	},
	createPayment: {
		requests: 10,
		duration: 60 * 5,
	},
	getPayments: {
		requests: 20,
		duration: 60 * 5,
	},
	getAllPayments: {
		requests: 10,
		duration: 60 * 10,
	},
	deployments: {
		create: {
			requests: 5,
			duration: 60 * 10,
		},
		status: {
			requests: 30,
			duration: 60,
		},
	},
};
