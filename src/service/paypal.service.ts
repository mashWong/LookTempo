import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PayPalService {
  // private clientId = 'Aes591zsdd-vmLb0Sw_G1g2PdvPRXZFoy65A0RgVeGhl2-9s6CL_eqq7dIGLCSm1TiCVu2wbQZgVzjQF';
  private clientId = 'AaawTP4-nETAIhSxIFw_7QIdC9_irtYfoZmXxACiZFpCSs2wGOx4zs1hOoWIgGUV_ymA5l8Do0XZj1v8';
  // private clientSecret = 'EDyVuc_hE84ZCsjqXwcPpdKYxeOFSZsgykuM8OIJRxuu0bqWHRURInUX0tHbtuFC4k4g-6VU_f8VXUqI';
  private clientSecret = 'EP458oYYgbandQxyqfmjf4tRxM8AqFqAILhQu-CEP4mQ56JHoxkg3lDcpeOavYj9nBdXf_yqSr3_w3wG';
  // private apiUrl = 'https://api-m.sandbox.paypal.com'; // 沙盒环境，生产环境请改为 https://api-m.paypal.com
  private apiUrl = 'https://api-m.paypal.com';

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await axios.post(`${this.apiUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
        'Accept': 'application/json',
        'Accept-Language': 'en_US'
      }
    });
    return response.data.access_token;
  }

  // PROD-79C62717UY514935E
  async createProduct(name: string, description: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    const response = await axios.post(`${this.apiUrl}/v1/catalogs/products`, {
      name: name,
      description: description,
      type: 'SERVICE',
      category: 'SOFTWARE',
      image_url: 'https://example.com/image.jpg',
      home_url: 'https://example.com/home'
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  async listProduct(): Promise<any> {
    const accessToken = await this.getAccessToken();
    const response = await axios.get(`${this.apiUrl}/v1/catalogs/products`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  async createPlan(productId: string, planData: any): Promise<any> {
    const accessToken = await this.getAccessToken();
    const response = await axios.post(`${this.apiUrl}/v1/billing/plans`,
      {
        "id": "P-5ML4271244454362WXNWU5NQ",
        "product_id": productId,
        "name": "Video Streaming Service Plan",
        "description": "Video Streaming Service basic plan",
        "status": "ACTIVE",
        "billing_cycles": [
          {
            "frequency": {
              "interval_unit": "MONTH",
              "interval_count": 1
            },
            "tenure_type": "TRIAL",
            "sequence": 1,
            "total_cycles": 2,
            "pricing_scheme": {
              "fixed_price": {
                "value": "3",
                "currency_code": "USD"
              },
              "version": 1,
              "create_time": "2020-05-27T12:13:51Z",
              "update_time": "2020-05-27T12:13:51Z"
            }
          },
          {
            "frequency": {
              "interval_unit": "MONTH",
              "interval_count": 1
            },
            "tenure_type": "TRIAL",
            "sequence": 2,
            "total_cycles": 3,
            "pricing_scheme": {
              "fixed_price": {
                "currency_code": "USD",
                "value": "6"
              },
              "version": 1,
              "create_time": "2020-05-27T12:13:51Z",
              "update_time": "2020-05-27T12:13:51Z"
            }
          },
          {
            "frequency": {
              "interval_unit": "MONTH",
              "interval_count": 1
            },
            "tenure_type": "REGULAR",
            "sequence": 3,
            "total_cycles": 12,
            "pricing_scheme": {
              "fixed_price": {
                "currency_code": "USD",
                "value": "10"
              },
              "version": 1,
              "create_time": "2020-05-27T12:13:51Z",
              "update_time": "2020-05-27T12:13:51Z"
            }
          }
        ],
        "payment_preferences": {
          "auto_bill_outstanding": true,
          "setup_fee": {
            "value": "10",
            "currency_code": "USD"
          },
          "setup_fee_failure_action": "CONTINUE",
          "payment_failure_threshold": 3
        },
        "taxes": {
          "percentage": "10",
          "inclusive": false
        },
        "create_time": "2020-05-27T12:13:51Z",
        "update_time": "2020-05-27T12:13:51Z",
        "links": [
          {
            "href": "https://api-m.paypal.com/v1/billing/plans/P-5ML4271244454362WXNWU5NQ",
            "rel": "self",
            "method": "GET"
          },
          {
            "href": "https://api-m.paypal.com/v1/billing/plans/P-5ML4271244454362WXNWU5NQ",
            "rel": "edit",
            "method": "PATCH"
          },
          {
            "href": "https://api-m.paypal.com/v1/billing/plans/P-5ML4271244454362WXNWU5NQ/deactivate",
            "rel": "deactivate",
            "method": "POST"
          },
          {
            "href": "https://api-m.paypal.com/v1/billing/plans/P-5ML4271244454362WXNWU5NQ/update-pricing-schemes",
            "rel": "edit",
            "method": "POST"
          }
        ]
      }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // P-7EY05624Y6703501MM5O7WGQ
  async createSubscription(subscriberData: any): Promise<any> {
    const accessToken = await this.getAccessToken();

    console.log(subscriberData);
    const response = await axios.post(`${this.apiUrl}/v1/billing/subscriptions`, {
      plan_id: '',
      start_time: subscriberData.startTime, // ISO 8601 格式的时间字符串
      quantity: '1',
      subscriber: {
        name: {
          given_name: subscriberData.givenName,
          surname: subscriberData.surname
        },
        email_address: subscriberData.emailAddress
      },
      application_context: {
        brand_name: 'Your Brand Name',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: 'https://example.com/return-url',
        cancel_url: 'https://example.com/cancel-url'
      }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  async listPlan(): Promise<any> {
    const accessToken = await this.getAccessToken();
    const response = await axios.get(`${this.apiUrl}/v1/billing/plans`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  // I-EBGUWLK4VEUY
  // P-8DS56675VT8205513M5O43HQ
  async querySubscription(subscriberId: any): Promise<any> {
    const accessToken = await this.getAccessToken();
    const response = await axios.get(`${this.apiUrl}/v1/billing/subscriptions/${subscriberId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }
}