// coinbaseButtonOverride.ts
import { initOnRamp } from "@coinbase/cbpay-js";

let isSetupInitiated = false;

export const setupCoinbaseButtonOverride = (options) => {
  if (isSetupInitiated) {
    return;
  }
  
  isSetupInitiated = true;

  const {
    appId,
    addresses,
    assets,
    debug = false
  } = options;

  let onrampInstance = null;
  
  // Initialize the Coinbase Pay instance
  initOnRamp({
    appId,
    widgetParameters: {
      addresses,
      assets,
    },
    onSuccess: () => {
      if (debug) console.log('Coinbase transaction successful');
    },
    onExit: () => {
      if (debug) console.log('Coinbase widget closed');
    },
    onEvent: (event) => {
      if (debug) console.log('Coinbase event:', event);
    },
    experienceLoggedIn: 'popup',
    experienceLoggedOut: 'popup',
    closeOnExit: true,
    closeOnSuccess: true,
  }, (_, instance) => {
    onrampInstance = instance;
    if (debug) console.log('Coinbase instance initialized');
  });

  const findButtonInShadowDOM = (root) => {
    const shadows = root.querySelectorAll('*');
    for (const element of shadows) {
      if (element.shadowRoot) {
        const button = element.shadowRoot.querySelector('[data-testid="buy-crypto-button"]');
        if (button) {
          return button;
        }
        const deepButton = findButtonInShadowDOM(element.shadowRoot);
        if (deepButton) {
          return deepButton;
        }
      }
    }
    return null;
  };

  const setupOverride = () => {
    const button = findButtonInShadowDOM(document);
    
    if (button && onrampInstance) {
      if (debug) console.log('Found button and Coinbase instance ready');
      
      // Remove disabled state
      button.classList.remove('disabled');
      button.removeAttribute('disabled');
      
      // Remove all existing click handlers
      const newButton = button.cloneNode(true);
      button.parentNode?.replaceChild(newButton, button);
      
      // Add our new click handler
      newButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (debug) console.log('Opening Coinbase widget');
        onrampInstance?.open();
      });

      return true;
    }
    
    return false;
  };

  // Poll for both button and onramp instance
  const startTime = Date.now();
  const checkInterval = setInterval(() => {
    if (setupOverride() || Date.now() - startTime > 30000) {
      clearInterval(checkInterval);
      if (Date.now() - startTime > 30000) {
        if (debug) console.warn('Timeout reached while setting up Coinbase button override');
      }
    }
  }, 500);

  // Cleanup function
  return () => {
    clearInterval(checkInterval);
    onrampInstance?.destroy();
    isSetupInitiated = false;
  };
};