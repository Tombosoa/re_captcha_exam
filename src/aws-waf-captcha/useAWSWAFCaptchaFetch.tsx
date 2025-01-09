// Intercepts fetch requests and forces CAPTCHA completion with a modal popup before every fetch.
export function useAWSWAFCaptchaFetch() {
  const apiUrl = import.meta.env.VITE_CAPTCHA_API_KEY;
  const captchaFetch = (input: RequestInfo, init?: RequestInit) => {
    document.body.style.cursor = 'wait';

    const modalOverlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('modal');
    const captchaForm = document.getElementById('captchaForm');

    if (modalOverlay && modal && captchaForm) {
      modalOverlay.style.display = 'block';
      modal.style.display = 'block';

      return new Promise<Response>((resolve) => {
        window.AwsWafCaptcha.renderCaptcha(captchaForm, {
          onSuccess: () => {
            modalOverlay.style.display = 'none';
            modal.style.display = 'none';
            resolve(window.AwsWafIntegration.fetch(input, init));
          },
          onLoad: () => {
            document.body.style.cursor = 'default';
          },
          apiKey: apiUrl,
        });
      });
    } else {
      console.error('Modal elements are not found in the DOM');
      return Promise.reject(new Error('Modal elements are not found in the DOM'));
    }
  };

  return captchaFetch;
}
