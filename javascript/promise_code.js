/* eslint-disable no-unused-vars */
import {proceduresFromSitePages} from './sitepage_data_manipulator.js';
import {procedureToText} from './format_procedure_labeling.js';
const url = 'URL_GOES_HERE';

/**
 * Example code for pulling page data
 */
async function promiseAttempt() {
  await fetch(url)
      .then((data) => data.text())
      .then((text) => {
        const procedures = proceduresFromSitePages(text);
        const newProc = procedures
          .map((procedure) => procedureToText(procedure, 'none', 'text-array'))
      });
}

promiseAttempt();

// get procedures using pagedatamanipulator
// format the procedures usiing formatprocedure
// return the code using ^
