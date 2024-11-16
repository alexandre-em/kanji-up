export const openPopup = (url: string) => {
  return new Promise((resolve, reject) => {
    const popup = window.open(url, 'popup', 'popup=true');

    if (popup) {
      popup.window.onload = () => {
        console.log('Loaded');
        popup.close();
      };

      popup.window.addEventListener('load', () => {
        popup.close();
      });

      popup.window.addEventListener('close', () => {
        resolve(true);
      });

      popup.window.addEventListener('error', () => {
        reject(false);
      });
    } else {
      reject(false);
    }
  });
};
