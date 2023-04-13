/**
 * Goal is to go through all procedures PER header
 */
/**
 * Holds the headers
 */
class Headers {
  /**
   * Creates array to hold headers
   */
  constructor() {
    this.headers = [];
    this.headerArray = [];
  };
  /**
   * add header to header array, make empty array for header
   * @param {string} name header name
   */
  addHeader(name) {
    this.headers.push(name);
  };
  /**
   *  returns array of header names
   * @return {array} array of header names
   */
  returnHeaders() {
    return this.headers;
  };
  /**
   * adds procedure to header array
   * @param {object} procedure the procedure object
   */
  addToHeaderArr(procedure) {
    this.headerArray.push(procedure);
  }
  /**
   * returns header array
   * @param {string} header header name
   * @return {array} header array
   */
  returnHeaderArray() {
    return this.headerArray;
  }
}

/**
 * returns array of header names
 * @param {array} procedures array containing all procs
 * @return {array} header names
 */
export function getHeaders(procedures) {
  const headers = new Headers();
  procedures.forEach((procedure) => {
    const name = procedure.header;
    if (!(headers.headers.includes(name))) {
      headers.addHeader(name);
    };
  });
  return headers.returnHeaders();
}

/**
 * returns array of header names
 * @param {string} headerName string to match
 * @param {array} procedures array containing all procs
 * @return {array} matching array items
 */
export function getHeaderArray(headerName, procedures) {
  const headers = new Headers();
  procedures.forEach((procedure) => {
    const name = procedure.header;
    if (headerName === name) {
      headers.addToHeaderArr(procedure);
    };
  });
  return headers.returnHeaderArray();
};
