import {getHeaderArray} from './get_header_groups.js';


/**
 * gets the collection items from procedures
 * @param {string} header header name
 * @param {array} procedures array of procedures
 * @return {array} array of collection items
 */
export function getCollectionItems(header, procedures) {
  if (!procedures) {
    return null;
  }
  const matchedProcs = getHeaderArray(header, procedures);
  const collectionItemsArr = matchedProcs
      .filter((proc) => proc.containlist === true && proc.listItems)
      .map((proc) => {
        return proc.listItems
            .filter((listItems) => listItems.textType ==='collect')
            .map((listItems) => listItems.text);
      })
      .filter((procs) => (procs.length > 0))
      .map((items) => [...new Set(items)]);
  return collectionItemsArr;
}

