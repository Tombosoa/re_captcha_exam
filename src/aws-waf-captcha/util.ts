import Envo from "./wafenv.json";

interface WAFEnv {
  JSAPI_URL: string;
  [key: string]: any; // To allow additional properties in the object
}

// Load the WAF environment at startup
export async function loadWAFEnv(envFile: string = '/wafenv.json'): Promise<void> {
  try {
    const response = await fetch(envFile);
    console.log('Fetch response:', response);
    if (!response.ok) {
      throw new Error(`Error loading ${envFile}: ${response.statusText}`);
    }
    const envData: WAFEnv = await response.json();
    console.log('WAF data:', envData);
    (window as any).AWS_WAF_ENV = envData;
  } catch (error) {
    console.error('Error loading the WAF environment:', error);
  }
}

// Returns the loaded WAF environment
export function getWAFEnv() {
  return (window as unknown as { AWS_WAF_ENV?: WAFEnv }).AWS_WAF_ENV;
}

// Dynamically load the AWS WAF JS API script
export function loadScript(): void {
  if (document.getElementById('AwsWAFScript')) return; // Avoid loading the script multiple times

  const env = Envo;

  if (!env || !env.JSAPI_URL) {
    console.error('Missing JSAPI_URL in the WAF environment');
    return;
  }

  const AwsWafScript = document.createElement('script');
  AwsWafScript.id = 'AwsWAFScript';
  AwsWafScript.async = true; // Ensures non-blocking behavior
  AwsWafScript.src = env.JSAPI_URL;
  AwsWafScript.onload = () => console.log('AWS WAF JS API script loaded successfully');
  AwsWafScript.onerror = () => console.error('Error loading the AWS WAF JS API script');
  document.head.appendChild(AwsWafScript);
}
