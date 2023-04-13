
/**
 * Class that holds the procedure sentences
*/
class ProcedureText {
  /**
    * Constructor that makes the array for final sentence structure
    */
  constructor() {
    this.readableText = [];
    this.htmlText = [];
    this.labeledText = [];
    this.currentNest = 0;
  }
  /**
        * Pushes text to an array
        * @param {array} sentences Sentences to add to output
        * @param {int} num a number for nestlevel
        * @return {string} the text that was added
        */
  addSentence({array: sentences, type, nest: num = 0}) {
    for (const sentence of sentences) {
      this.readableText.push(`${' '.repeat(num)} ${sentence}`);
      this.htmlText.push(this.parseSentence(sentence, num));
      this.labeledMaker(sentence, type);
    }
    return sentences;
  }
  /**
   * cifgures out which type of text each line is
   * @param {string} text sentence to add
   * @param {string} type type of sentence
   */
  labeledMaker(text, type) {
    switch (type) {
      case 'title': text = `[t]${text}`;
        break;
      case 'instructions': text = `[i]${text}`;
        break;
      case 'action': text = `[a]${text}`;
        break;
      case 'list': text = `[l]${text}`;
        break;
      case 'collect': text = `[c]${text}`;
        break;
      case 'paragraph': text = `[p]${text}`;
        break;
      default: text = `[g]${text}`;
    }
    this.labeledText.push(text);
  }
  /**
   * parse text into HTML
   * @param {string} sentence text needing parse
   * @param {number} nestLevel the current nest level
   * @return {string} sentence with HTML code
   */
  parseSentence(sentence, nestLevel) {
    return this.listMaker(this.inSentenceCheck(sentence, nestLevel), nestLevel);
  }
  /**
 * adds ul/li to lists
 * @param {string} sentence the raw sentence
 * @param {number} nestLevel the number deep
 * @return {string} parsed sentence
 */
  listMaker(sentence, nestLevel) {
    if (nestLevel === 0) {
      return sentence;
    } else {
      if (nestLevel > this.currentNest) {
        this.currentNest = nestLevel;
        return `<ul><li>${sentence}</li>`;
      } else if (nestLevel === this.currentNest) {
        return `<li>${sentence}</li>`;
      } else if (nestLevel < this.currentNest) {
        const change = this.currentNest - nestLevel;
        this.currentNest = nestLevel;
        return `${'</ul>'.repeat(change)}<li>${sentence}</li>`;
      }
    }
  }
  /**
   * checks for lockout, strong, known issue
   * @param {string} sentence the procedure sentence
   * @param {number} nestLevel how deep
   * @return {string} modified sentence
   */
  inSentenceCheck(sentence, nestLevel) {
    // check for strong
    if ((sentence.includes(':') && nestLevel > 0)) {
      sentence = `<strong>${sentence.replace(':', ':</strong>')}`;
    }
    // for known issues
    if (sentence.includes('Known Issue')) {
      sentence = `<span style ="color: #ff6600;">
        ${sentence.replace('Known Issue', 'Known Issue</span>')}`;
    }
    // for links
    if ((sentence.includes('[') && sentence.includes(']'))) {
      const regex = /(?:\[)(.*)(?:\])/;
      const url = sentence.match(regex)[1];
      sentence = sentence.replace(regex,
          `<a href="${url}" target="_blank" rel="noopener">Link</a>`);
    }

    return sentence;
  }
  /**
    * grab the array
    * @param {string} returnType text or html
    * @return {array} array of sentences
    */
  printSentences(returnType) {
    if (returnType === 'labeled') {
      return this.labeledText;
    }
    if (returnType === 'text') {
      return this.readableText.join('\r\n');
    };
    if (returnType === 'html') {
      if (this.currentNest > 0) {
        this.htmlText.push(`${'</ul>'.repeat(this.currentNest)}`);
        this.currentNest = 0;
      }
      return this.htmlText.join('\r\n');
    };
    if (returnType.includes('text-array')) {
      return this.readableText;
    };
    if (returnType === 'html-array') {
      if (this.currentNest > 0) {
        this.htmlText.push(`${'</ul>'.repeat(this.currentNest)}`);
        this.currentNest = 0;
      }
      return this.htmlText;
    };
  };
}

// 2nd argument is sort method, can be blank or..
// childLength = # of children
// nestCount # of steps?
/**
   * For output of Procedure
   * @param {array} procedure the full procedure
   * @param {string} sortMethod string for type of sort
   *    childLength for # of children
   *    nestCount for how deep nested gets
   * @param {string} returnType type of text:
   *    text, text-array, text-array-no-spaces
   *    html, html-array
   * @return {array} new procedure setup
   */
export function procedureToText(procedure, sortMethod, returnType) {
  /* Array for sentences */
  const procText = new ProcedureText();
  const title = procedure.procedure;
  const sentences = procedure.procedureText;
  procText.addSentence({array: [title], type: 'title'});
  if (sentences) {
    procText.addSentence({array: [sentences],
      type: 'paragraph'});
  };
  // If it has a list
  if (procedure.containlist === true && procedure.listItems) {
    const nestList = procedure.listItems
        .filter((item) => item.nestLevel === 1)
        .map((el) => el.id);
    findAndPrintChildren(nestList);
  }
  /**
   * finds and print ids loop
   * @param {array} IDs array of IDs to loop through
   * @param {class} procText class containing the procedures
   */
  function findAndPrintChildren(IDs) {
    switch (sortMethod) {
      case 'childLength':
        IDs = sortByChildrenCount(IDs);
        break;
      case 'nestCount':
        IDs = sortByNestCount(IDs);
        break;
      default:
      // do nothing, no sort
    }
    IDs.forEach((childID) => {
      const idObj = procedure.listItems.find((el) => el.id === childID);
      const childs = idObj.childID;
      if (idObj) {
        const type = stringCheck(procedure.listItems, idObj);
        let spacing = idObj.nestLevel;
        if (returnType === 'text-array-no-spaces') {
          spacing = 0;
        }
        procText.addSentence(
            {
              array: [idObj.text],
              type,
              nest: spacing,
            });
      }
      if (childs) {
        findAndPrintChildren(idObj.childID, procText);
      }
    },
    );
  }
  /**
 * takes in an unsorted array, sorts by children count
 * @param {array} IDs children IDs
 * @return {array} children ID sorted by count of their children
 */
  function sortByChildrenCount(IDs) {
    const idCount = IDs.map((id) => {
      let count = 1;
      const idObj = procedure.listItems.find((el) => el.id === id);
      if (idObj.childID) {
        count += countChildren(idObj.childID);
      }
      /**
     * counts the total number of children
     * @param {array} IDs array of IDs
     * @return {number} count of children
     */
      function countChildren(IDs) {
        return IDs.reduce((count, id) => {
          const idObj = procedure.listItems.find((el) => el.id === id);
          if (idObj.childID) {
            const subcount = countChildren(idObj.childID);
            return count + subcount;
          };
          return count + 1;
        }, 0);
      }

      return {id, count};
    });
    return idCount.sort((a, b) => a.count - b.count)
        .map((el) => el.id);
  };

  /**
  * counts the total number of children
  * @param {array} IDs array of IDs
  * @return {number} count of children
  */
  function sortByNestCount(IDs) {
    const idCount = IDs.map((id) => {
      let count = 1;
      const idObj = procedure.listItems.find((el) => el.id === id);
      if (idObj.childID) {
        count = countMaxNest(idObj.childID);
      }
      return {id, count};
    });
    return idCount.sort((a, b) => a.count - b.count)
        .map((el) => el.id);
  };

  /**
     * counts the total number of children
     * @param {array} IDs array of IDs
     * @return {number} count of children
     */
  function countMaxNest(IDs) {
    let maxNestLevel;
    IDs.forEach((id) => {
      const idObj = procedure.listItems.find((el) => el.id === id);
      const nestLevel = idObj.nestLevel;
      maxNestLevel = maxNestLevel > nestLevel ? maxNestLevel : nestLevel;
      if (idObj.childID) {
        const subCount = countMaxNest(idObj.childID);
        maxNestLevel = maxNestLevel > subCount ? maxNestLevel : subCount;
      };
    });
    return maxNestLevel;
  }

  /**
         * Compares array of checks
         * @param {object} listObj all proc objects
         * @param {object} idObj  single proc object
         * @return {string} type of text
         */
  function stringCheck(listObj, idObj) {
    const text = idObj.text;
    const instruct = {type: 'instructions',
      arr: ['advise', 'instruct', 'inform']};
    const actions = {type: 'action',
      arr: ['follow', 'contact', 'collect', 'verify', 'send']};
    const num = {};
    const checksArr = [];
    checksArr.push(instruct, actions);

    checksArr.forEach((checks) => {
      checks.arr.forEach((check) => {
        const spot = text.toLowerCase().indexOf(check);
        if ((spot > -1 && (num.index && spot < num.index) ||
          spot > -1 && !(num.index))) {
          num.index = spot;
          num.typed = checks.type;
        }
      });
    });
    if (collectBoolCheck(listObj, idObj)) {
      num.typed = 'collect';
    };
    /**
     * checks if collection or not
         * @param {object} listObj all proc objects
         * @param {object} idObj  single proc object
     * @return {boolean} if collect or not
     */
    function collectBoolCheck(listObj, idObj) {
      if (idObj.parentID) {
        const parentCollect = listObj
            .filter((el) => el.id === idObj.parentID)
            .map((parent) => parent.text)[0]
            .toLowerCase()
            .includes('collect');
        const childs = idObj.childID;
        if (parentCollect === true && !childs) {
          return true;
        }
        return false;
      }
      return false;
    }

    if (!num.typed) {
      num.typed = 'guide';
    }
    idObj.textType = num.typed;
    return num.typed;
  }

  const newProcedure = structuredClone(procedure);
  newProcedure.formattedText = procText.printSentences(returnType);
  newProcedure.labeled = procText.printSentences('labeled');
  return newProcedure;
}

