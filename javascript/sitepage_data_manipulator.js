import {convert} from 'html-to-text';

/** Class creates a procedure object */
class Procedure {
  /**
  * @param {string} title contains the procedure title
  * @param {string} containlist  Booleon, if has list or not
  * @param {string} procedureText the sentences after the title
  * @param {string} list the bullet point data
  * @param {string} header contains the header
  */
  constructor(title, containlist, procedureText, list, header) {
    this.procedure = title;
    this.containlist = containlist;
    if (procedureText) {
      this.procedureText = procedureText;
    };
    if (list) {
      this.list = list;
    }
    this.header = header;
  }
}

/** contains all procedures */
class Procedures {
  /** build array of procedures */
  constructor() {
    this.procedures = [];
  }
  /**
   * To make each procedure
   * @param {array} procedureInfo contains procedure data
   * @return {object} the procedure as an object
   */
  newProcedure(procedureInfo) {
    // eslint-disable-next-line max-len
    const [title, booleonList, procedureText, listText, header] = procedureInfo;
    const proc = new Procedure(
        title, booleonList, procedureText, listText, header);
    this.procedures.push(proc);
    return proc;
  }
  /**
   * To get the procedures
   * @return {array} of procedure objects
   */
  getProcedures() {
    return this.procedures;
  }
}

/**
*Downloads sitepage, pushes data to class Procedures
*@param {string} text link to a site page
*@return {object} containing parsed data
*/
export function proceduresFromSitePages(text) {
  const siteProcedures = new Procedures();
  const regex =
          // eslint-disable-next-line max-len
          /<h2 class="rmex-rms-header-heading expanded">(.*)<\/h2>[\s\S]*?(?=\n.*?<h2)/gm;
  const headerSections = text.match(regex);
  /* for each header section */
  if (!headerSections) {
    return null;
  }
  for (const headerText of headerSections) {
    const header = getHeader(headerText);
    /**
             * Returns the header
             * @param {string} string contains the header section
             * @return {string} the header only
             */
    function getHeader(string) {
      const regex =
              /<h2 class="rmex-rms-header-heading expanded">(.*)<\/h2>/g;
      let match = string.match(regex)[0];
      match =
            match.replace(
                /<h2 class="rmex-rms-header-heading expanded">/g, '')
                .replace(/<\/h2>/g, '');
      return match;
    };

    /* regex finds procedures using starting text that is <Strong> */
    const regex =
          // eslint-disable-next-line max-len
          /^(.*<p>)?<strong>(.*)?<\/strong>(.|\n)*?(?=^(?<b>(<p>)?<strong>|(<\/ul>)?<\/div>))/gm;
    /* create the array */
    for (const strongSections of headerText.matchAll(regex)) {
      let strongText = strongSections[0];
      if (strongSections.groups?.b) {
        strongText += strongSections.groups.b;
      };
      // strongSections.forEach((strongText) => {
      const stripped = convert(strongText, {wordwrap: null});
      // Create the title
      const title = stripped.match(/(.*)/)[0].replace(/:$/, '');
      /* Create sentences based on list
          * to know if it should copy to next bold or not
          */
      const [boolList, procedureText, list] = getListData(strongText);
      /**
               * Get the list, bool, stences
               * @param {string} strongText text to review
               * @return {array} boolList, procedureText, list
               */
      function getListData(strongText) {
        let boolList;
        let procedureText;
        let list = '';
        if (strongText.includes('<li>')) {
          boolList = Boolean(true);
          const secondLineHMTL =
                  strongText.match(
                      /\<\/strong\>(?<txt>(.|\n)+?)(\<strong\>|\<li\>)/);
          if (secondLineHMTL) {
            // Sentences
            procedureText = convert(secondLineHMTL.groups.txt,
                {wordwrap: null})
                .replace(/(\r\n|\n|\r)/gm, '');
          }
          // List Items
          const listBuild = stripped.match(/ *?\*(.|\n)*/);
          if (listBuild) {
            list = stripped.match(/ *?\*(.|\n)*/)[0];
          }
        } else {
          // No list
          boolList = Boolean(false);
          const secAttempt =
                  strongText.match(
                      /\<\/strong\>(?<txt>(.|\n)+?)(\<strong\>)(.|\n)*/);
          if (secAttempt) {
            // Header text
            procedureText = convert(secAttempt.groups.txt,
                {wordwrap: null})
                .replace(/(\r\n|\n|\r)/gm, '');
          }
        }
        return [boolList, procedureText, list];
      }
      siteProcedures.newProcedure(
          [title, boolList, procedureText, list, header]);
    };
  }
  childParentIDAdder(siteProcedures.getProcedures());
  /**
 * Sets up the parent/child IDs in same object
 * @param {array} arr contains the proceudure objects
 */
  function childParentIDAdder(arr) {
    arr.forEach((obj, i) => {
      if (obj.containlist === true && (obj.list)) {
        const list = obj.list.split('\n');
        const level = [];
        const ob = [];
        /* For each list item*/
        list.map((row, j) => {
          const id = `${i}-${j}`;
          const spaceCount = row.match(/^ */)[0].length;
          if (spaceCount == 0) {
            return;
          }
          const startSpot = ((spaceCount + 1) / 2);
          const arrSpot = startSpot - 1;
          const lastSpot = level.length - 1;
          // always put in array
          level[arrSpot] = id;
          // below is for finding parentid using the array and current spot
          let parent;
          if (startSpot == 1) {
            parent = null;
            // insert parentID, find parentID, assign it
          } else if (startSpot > lastSpot) {
            // deeper nested
            parent = level[arrSpot - 1];
          } else if (startSpot == lastSpot) {
            parent = level[arrSpot - 1];
            // same level
          } else {
            parent = level[arrSpot - 1];
            level.splice(arrSpot + 1);
            // less nested, fall back
          }
          const rx = / *\* *(?=\w)/;
          const fixedRow = row.replace(rx, '');
          const arrItem = {
            nestLevel: startSpot,
            text: fixedRow,
            parentID: parent,
            id: i + '-' + j,
          };
          ob.push(arrItem);
        });
        // work on this section to add child nodes to the object
        ob.forEach((lines) => {
          // add child nodes to the objects
          const filtered = ob.filter((row) => {
            return (row.parentID == lines.id);
          });
          filtered.forEach((obj) => {
            if (!lines.childID) {
              lines.childID = [];
            }
            lines.childID.push(obj.id);
          });
        });
        obj.listItems = ob;
      }
    });
  };

  return siteProcedures.getProcedures();
}
