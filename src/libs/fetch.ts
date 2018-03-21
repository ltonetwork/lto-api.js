declare let exports: any;
declare let module: any;
declare let require: any;


const fetchSubstitute = (function () {

    if (typeof window !== 'undefined') {
        return window.fetch.bind(window);
    } else if (typeof self !== 'undefined') {
        return self.fetch.bind(self);
    } else if (typeof exports === 'object' && typeof module !== 'undefined') {
        return require('node-fetch');
    } else {
        throw new Error('Your environment is not defined');
    }

})();


export default fetchSubstitute;
