import dotenv from "dotenv";
import axios from "axios";
dotenv.config({ path: ".env.local" });

class TelepersonAPIs {
    constructor() {
        this.apiKey = process.env.TELEPERSON_API_KEY;
        this.baseUrl = "https://intapi.teleperson.com";
    }

    login = async (username) => {
        try {
            if (!username) {
                return {
                    success: false,
                    data: null,
                    message: "Username is required",
                };
            }

            const response = await axios.post(
                `${this.baseUrl}/auth/login`,
                { username } // Send username in the body
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(error.message);

            return {
                success: false,
                message: error.message,
            };
        }
    };

    fetchUserByEmail = async (email) => {
        try {
            if (!email) {
                return {
                    success: false,
                    data: null,
                    message: "Email is required",
                };
            }

            const auth = await this.login(email);
            if (!auth.success) return auth;
            const accessToken = auth.data.access_token;

            const response = await axios.get(`${this.baseUrl}/users/${email}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-api-key": `Bearer ${this.apiKey}`,
                },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    // Get all vendors assigned to a user
    fetchVendorsByUserId = async ({ email, userId }) => {
        try {
            if (!userId) {
                return {
                    success: false,
                    data: null,
                    message: "User ID is required",
                };
            }
            if (!email) {
                return {
                    success: false,
                    data: null,
                    message: "Username is required",
                };
            }
            const auth = await this.login(email);
            if (!auth.success) return auth;
            const accessToken = auth.data.access_token;

            const response = await axios.get(`${this.baseUrl}/vendors/user/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-api-key": `Bearer ${this.apiKey}`,
                },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    // Get a vendor by ID
    fetchVendorById = async ({ username, id }) => {
        try {
            if (!id) {
                return {
                    success: false,
                    data: null,
                    message: "Vendor ID is required",
                };
            }
            if (!username) {
                return {
                    success: false,
                    data: null,
                    message: "Username is required",
                };
            }
            const auth = await this.login(username);
            if (!auth.success) {
                return auth;
            }
            const accessToken = auth.data.access_token;
            const response = await axios.get(`${this.baseUrl}/vendors/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-api-key": `Bearer ${this.apiKey}`,
                },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    // Get vendors from user's My Vendor Hub (top vendors)
    fetchTopVendorsByUserId = async ({ username, userId }) => {
        try {
            if (!userId) {
                return {
                    success: false,
                    data: null,
                    message: "User ID is required",
                };
            }
            if (!username) {
                return {
                    success: false,
                    data: null,
                    message: "Username is required",
                };
            }
            const auth = await this.login(username);
            if (!auth.success) {
                return auth;
            }
            const accessToken = auth.data.access_token;
            const response = await axios.get(`${this.baseUrl}/vendors/top/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-api-key": `Bearer ${this.apiKey}`,
                },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    vendorLounge = async (email) => {
        try {
            if (!email) {
                return {
                    success: false,
                    data: null,
                    message: "Email is required",
                };
            }

            const auth = await this.login(email);
            if (!auth.success) return auth;
            const accessToken = auth.data.access_token;

            const user = await this.fetchUserByEmail(email);
            if (!user.success) return user;
            const userId = user.data.id;

            const allVendors = [];
            let currentPage = 1;
            let keepFetching = true;
            const VENDORS_PER_PAGE = 50;
            const PAGES_PER_BATCH = 3;

            while (keepFetching) {
                const pageNumbers = Array.from(
                    { length: PAGES_PER_BATCH },
                    (_, i) => currentPage + i
                );

                const promises = pageNumbers.map((page) =>
                    axios.get(`${this.baseUrl}/vendors/removed/${userId}`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                            "x-api-key": `Bearer ${this.apiKey}`,
                        },
                        params: { page },
                    })
                );

                const responses = await Promise.all(promises);
                const vendorsFromPages = responses.map((response) => response.data.data).flat();

                if (vendorsFromPages.length > 0) {
                    allVendors.push(...vendorsFromPages);
                }

                if (vendorsFromPages.length < VENDORS_PER_PAGE * PAGES_PER_BATCH) {
                    keepFetching = false;
                } else {
                    currentPage += PAGES_PER_BATCH;
                }
            }

            const nonNullVendors = allVendors.filter((vendor) => vendor.companyName);

            return {
                success: true,
                data: {
                    vendors: nonNullVendors,
                    numVendors: nonNullVendors.length,
                    vendorNames: nonNullVendors.map((vendor) => vendor.companyName),
                    vendorNameAndDescriptions: nonNullVendors.map((vendor) => ({
                        name: vendor.companyName,
                        description: vendor.companyOverview,
                    })),
                },
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    // Get transactions for a user
    fetchTransactions = async (email) => {
        try {
            if (!email) {
                return {
                    success: false,
                    data: null,
                    message: "Email is required",
                };
            }
            // Step 1: Login to get access token
            const auth = await this.login(email);
            if (!auth.success) return auth;

            // Step 2: Fetch user by email to get userId
            const user = await this.fetchUserByEmail(email);
            if (!user.success) return user;
            const userId = user.data.id;

            // Step 3: Fetch transactions for userId
            const accessToken = auth.data.access_token;
            const response = await axios.get(`${this.baseUrl}/transactions`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-api-key": `Bearer ${this.apiKey}`,
                },
                params: { userId },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    // Get all vendors assigned to a user
    vendorHub = async ({ accessToken, userId }) => {
        try {
            if (!accessToken) {
                return {
                    success: false,
                    data: null,
                    message: "Access Token is required",
                };
            }
            if (!userId) {
                return {
                    success: false,
                    data: null,
                    message: "User ID is required",
                };
            }

            const response = await axios.get(`${this.baseUrl}/vendors/top/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-api-key": `Bearer ${this.apiKey}`,
                },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    vendorsByEmail = async (email) => {
        try {
            if (!email) {
                return {
                    success: false,
                    data: null,
                    message: "Email is required",
                };
            }
            // Step 1: Login to get access token
            const auth = await this.login(email);
            if (!auth.success) return auth;
            const accessToken = auth.data.access_token;

            // Step 2: Fetch user by email to get userId
            const user = await this.fetchUserByEmail(email);
            if (!user.success) return user;
            const userId = user.data.id;

            // Step 3: Fetch vendors by userId
            const vendors = await this.vendorHub({ accessToken, userId });
            const nonNullVendors = vendors.data.data.filter((vendor) => vendor.companyName);

            if (vendors.success) {
                return {
                    success: true,
                    data: {
                        vendors: nonNullVendors,
                        numVendors: nonNullVendors.length,
                        vendorNames: nonNullVendors.map((vendor) => vendor.companyName),
                        vendorNameAndDescriptions: nonNullVendors.map((vendor) => ({
                            name: vendor.companyName,
                            description: vendor.companyOverview,
                        })),
                    },
                };
            }
            return vendors;
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    _fetchUserByEmail = async ({ email, accessToken }) => {
        try {
            const response = await axios.get(`${this.baseUrl}/users/${email}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    "x-api-key": `Bearer ${this.apiKey}`,
                },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };

    _fetchHubData = async ({ accessToken, userId }) => {
        const vendors = await this.vendorHub({ accessToken, userId });
        const nonNullVendors = vendors.data.data.filter((vendor) => vendor.companyName);

        if (vendors.success) {
            return {
                success: true,
                data: {
                    vendors: nonNullVendors,
                    numVendors: nonNullVendors.length,
                    vendorNames: nonNullVendors.map((vendor) => vendor.companyName),
                    vendorNameAndDescriptions: nonNullVendors.map((vendor) => ({
                        name: vendor.companyName,
                        description: vendor.companyOverview,
                    })),
                },
            };
        }
        return vendors;
    };

    _fetchLoungeData = async ({ accessToken, userId }) => {
        const allVendors = [];
        let currentPage = 1;
        let keepFetching = true;
        const VENDORS_PER_PAGE = 50;
        const PAGES_PER_BATCH = 3;

        while (keepFetching) {
            const pageNumbers = Array.from({ length: PAGES_PER_BATCH }, (_, i) => currentPage + i);

            const promises = pageNumbers.map((page) =>
                axios.get(`${this.baseUrl}/vendors/removed/${userId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                        "x-api-key": `Bearer ${this.apiKey}`,
                    },
                    params: { page },
                })
            );

            const responses = await Promise.all(promises);
            const vendorsFromPages = responses.map((response) => response.data.data).flat();

            if (vendorsFromPages.length > 0) {
                allVendors.push(...vendorsFromPages);
            }

            if (vendorsFromPages.length < VENDORS_PER_PAGE * PAGES_PER_BATCH) {
                keepFetching = false;
            } else {
                currentPage += PAGES_PER_BATCH;
            }
        }

        const nonNullVendors = allVendors.filter((vendor) => vendor.companyName);

        return {
            success: true,
            data: {
                vendors: nonNullVendors,
                numVendors: nonNullVendors.length,
                vendorNames: nonNullVendors.map((vendor) => vendor.companyName),
                vendorNameAndDescriptions: nonNullVendors.map((vendor) => ({
                    name: vendor.companyName,
                    description: vendor.companyOverview,
                })),
            },
        };
    };

    allVendors = async (email) => {
        try {
            const auth = await this.login(email);
            if (!auth.success) return auth;
            const accessToken = auth.data.access_token;

            const user = await this._fetchUserByEmail({ email, accessToken });
            if (!user.success) return user;
            const userId = user.data.id;

            const [hubResult, loungeResult] = await Promise.all([
                this._fetchHubData({ accessToken, userId }),
                this._fetchLoungeData({ accessToken, userId }),
            ]);

            if (!hubResult.success) {
                return hubResult;
            }
            if (!loungeResult.success) {
                return loungeResult;
            }

            return {
                success: true,
                data: {
                    hub: hubResult.data,
                    lounge: loungeResult.data,
                },
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: error.message,
            };
        }
    };
}

export default new TelepersonAPIs();
