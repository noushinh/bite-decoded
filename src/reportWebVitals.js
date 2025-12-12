// This file is the standard Create React App perf hook helper.
// It dynamically imports web-vitals and reports metrics if a callback is provided.
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(() => {
      // ignore failures to load web-vitals in environments without it
    });
  }
};

export default reportWebVitals;
