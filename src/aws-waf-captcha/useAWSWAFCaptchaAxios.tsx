import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';

export function useAWSWAFCaptchaAxios(
  onCaptchaEvent: (event: string) => void = (event) => console.log(event)
): AxiosInstance {
  const captchaAxios = axios.create();
  const apiUrl = import.meta.env.VITE_CAPTCHA_API_KEY;
  function renderCaptcha(): Promise<unknown> {
    document.body.style.cursor = 'wait';

    const modalOverlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('modal');
    const captchaForm = document.getElementById('captchaForm');

    if (modalOverlay && modal && captchaForm) {
      modalOverlay.style.display = 'block';
      modal.style.display = 'block';

      return new Promise((resolve) => {
        onCaptchaEvent('onCaptchaRequired');
        window.AwsWafCaptcha.renderCaptcha(captchaForm, {
          onSuccess: (wafToken: unknown) => {
            modalOverlay.style.display = 'none';
            modal.style.display = 'none';
            onCaptchaEvent('onSuccess');
            resolve(wafToken);
          },
          onLoad: () => {
            document.body.style.cursor = 'default';
            onCaptchaEvent('onLoad');
          },
          onError: () => onCaptchaEvent('onError'),
          onPuzzleTimeout: () => onCaptchaEvent('onPuzzleTimeout'),
          onPuzzleIncorrect: () => onCaptchaEvent('onPuzzleIncorrect'),
          onPuzzleCorrect: () => onCaptchaEvent('onPuzzleCorrect'),
          apiKey: apiUrl,
        });
      });
    } else {
      console.error('Modal elements are not found in the DOM');
      return Promise.reject(new Error('Modal elements are not found in the DOM'));
    }
  }

  function captchaRequired(error: AxiosError): boolean {
    return (
      error.response?.status === 405 &&
      error.response?.headers['x-amzn-waf-action'] === 'captcha'
    );
  }

  // Response interceptor to handle CAPTCHA rendering
  captchaAxios.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      if (captchaRequired(error)) {
        const token = await renderCaptcha();
        if (token && error.config) {
          // Optionally set the x-aws-waf-token header if cross-domain requests require it
          const headers = new AxiosHeaders(error.config.headers);
          headers.set('x-aws-waf-token', String(token));
          error.config.headers = headers;

          return captchaAxios.request(error.config);
        }
      }
      return Promise.reject(error);
    }
  );

  // Request interceptor to ensure a WAF token exists
  captchaAxios.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await window.AwsWafIntegration.getToken();
      if (token) {
        config.headers.set('x-aws-waf-token', String(token));
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return captchaAxios;
  
}
