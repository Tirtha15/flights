var uuid = require('node-uuid');
var moment = require('moment');
var validator = require('validator');
var S = require('string');
var cheerio = require('cheerio');
var crypto = require('crypto');
var neo4j = require('neo4j');
var elasticsearch = require('elasticsearch');
var uaParser = require('ua-parser-js');
/**
 * Return a uuid v4 string based on Section 4.4 of RFC4122 [ http://www.ietf.org/rfc/rfc4122.txt ]
 *
 *     utils.uuid();
 *     // => "109156be-c4fb-41ea-b1b4-efe1671c5826"
 *
 * @param
 * @return {String}
 */
exports.uuid = function() {
    return uuid.v4();
  }
  /**
   * Return true/false based on whether or not the passed string is a valid uuid v4 string based on Section 4.4 of RFC4122 [ http://www.ietf.org/rfc/rfc4122.txt ]
   *
   *     utils.isuuid("109156be-c4fb-41ea-b1b4-efe1671c5826");
   *     // => true
   *
   * @param {String} str
   * @return {Boolean}
   */
exports.isuuid = function(str) {
    var regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    return regex.test(str);
  }
  /**
   * Return a unique identifier with the given `len`.
   *
   *     utils.uid(10);
   *     // => "FDaS435D2z"
   *
   * @param {Number} len
   * @return {String}
   */
exports.uid = function(len) {
  var buf = [],
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    charlen = chars.length;
  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }
  return buf.join('');
};
/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uidLight(10);
 *     // => "GHAS4F5D24"
 *
 * @param {Number} len
 * @return {String}
 */
exports.uidLight = function(len) {
  var buf = [],
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    charlen = chars.length;
  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }
  return buf.join('');
};

/**
 * Source: https://blog.tompawlak.org/generate-random-values-nodejs-javascript
 *
 * @param {Number} len
 * @return {String} hex
 */
exports.randomValueHex = function(len) {
  return crypto.randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len); // return required number of characters
};

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Return true / false based on whether or not the given string is a valid URL
 *
 * @param {String} url
 * @api private
 */
exports.isUrl = function(url) {
  // Taken from - https://gist.github.com/dperini/729294
  // Ongoing research - http://mathiasbynens.be/demo/url-regex
  var re_weburl = new RegExp("^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)" +
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" + "(?:" +
    // IP address exclusion
    // private & local networks
    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" + "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" + "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" + "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" + "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" + "|" +
    // host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
    // domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
    // TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" + ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:/\\S*)?" + "$", "i");
  return re_weburl.test(url);
};
/**
 * Return the SQL formatted string for the given datetime in ISO 8601 format
 *
 * @param {String} url
 * @api private
 */
exports.getStringFromDatetimeForSQL = function(time) {
  return moment.utc(time, moment.ISO_8601)
    .format("YYYY-MM-DD HH:mm:ss")
    .toString();
};
/**
 * Return the normalized form of the provided email id
 *
 * @param {String} email
 * @api private
 */
exports.normalizeEmail = validator.normalizeEmail;
/**
 * Return the normalized form of the provided email id
 *
 * @param {String} email
 * @api private
 */
exports.slugify = function(input) {
  // S('Global Thermonuclear Warfare').slugify().s // 'global-thermonuclear-warfare'
  return S(input)
    .slugify()
    .s;
};
exports.humanize = function(input) {
  return S(input)
    .humanize()
    .s;
}
exports.generateEnquiryRefId = function() {
  return moment()
    .format('YYMMDD') + exports.uidLight(5);
}
exports.generateProfRefId = function(userName) {
  var name = '';
  if (!userName)
    name = exports.uidLight(6);
  else {
    name = userName.replace(/[^A-Za-z0-9]/g, '') + '000000';
    name = name.substring(0, 6)
      .toUpperCase();
  }
  var refId = name + "-" + exports.uidLight(5);
  return refId;
}
exports.generateQuotationRefId = function(enquiryRefId) {
  return enquiryRefId + '-' + exports.uidLight(3);
}
exports.isValidEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  /*
   * Returrn foramtted time according to W3C.
   * Solution Credits: http://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
   */
exports.getW3CTime = function() {
  var now = new Date(),
    tzo = -now.getTimezoneOffset(),
    dif = tzo >= 0 ? '+' : '-',
    pad = function(num) {
      var norm = Math.abs(Math.floor(num));
      return (norm < 10 ? '0' : '') + norm;
    };
  return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + 'T' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) + dif + pad(tzo / 60) + ':' + pad(tzo % 60);
}
exports.getCityFromPincode = function(pincode) {
  if (pincode >= 560001 && pincode <= 560110) return "Bangalore";
  if ((pincode >= 400001 && pincode <= 400104) || (pincode >= 400611 && pincode <= 400613) || (pincode >= 400701 && pincode <= 400707) || (pincode >= 400601 && pincode <= 400608)) return "Mumbai";
  if ((pincode >= 110001 && pincode <= 110097) || (pincode >= 122001 && pincode <= 122018) || (pincode >= 201301 && pincode <= 201310) || (pincode >= 201001 && pincode <= 201010)) return "Delhi-NCR";
  if (pincode >= 600001 && pincode <= 600119) return "Chennai";
  if (pincode >= 500001 && pincode <= 501512) return "Hyderabad";
  if (pincode >= 411001 && pincode <= 411053) return "Pune";
  if (pincode >= 700001 && pincode <= 700099) return "Kolkata";
}
exports.getCityIdFromPincode = function(pincode) {
  if (pincode >= 560001 && pincode <= 560110) return "ea2c6351-b5e1-11e4-b350-06ee5a017435";
  if ((pincode >= 400001 && pincode <= 400104) || (pincode >= 400611 && pincode <= 400613) || (pincode >= 400701 && pincode <= 400707) || (pincode >= 400601 && pincode <= 400608)) return "ea330e08-b5e1-11e4-b350-06ee5a017435";
  if ((pincode >= 110001 && pincode <= 110097) || (pincode >= 122001 && pincode <= 122018) || (pincode >= 201301 && pincode <= 201310) || (pincode >= 201001 && pincode <= 201010)) return "ea33aa62-b5e1-11e4-b350-06ee5a017435";
  if (pincode >= 600001 && pincode <= 600119) return "ea34ebba-b5e1-11e4-b350-06ee5a017435";
  if (pincode >= 500001 && pincode <= 501512) return "ea342e91-b5e1-11e4-b350-06ee5a017435";
  if (pincode >= 411001 && pincode <= 411053) return "ea359442-b5e1-11e4-b350-06ee5a017435";
  if (pincode >= 700001 && pincode <= 700099) return "ea363863-b5e1-11e4-b350-06ee5a017435";
  return null;
}
exports.isServingCity = function(pincode) {
  if ((pincode >= 560001 && pincode <= 560110) || (pincode >= 400001 && pincode <= 400104) || (pincode >= 400611 && pincode <= 400613) || (pincode >= 400701 && pincode <= 400707) || (pincode >= 110001 && pincode <= 110097) || (pincode >= 122001 && pincode <= 122018) || (pincode >= 201301 && pincode <= 201310) || (pincode >= 201001 && pincode <= 201010) || (pincode >= 600001 && pincode <= 600119) || (pincode >= 500001 && pincode <= 501512) || (pincode >= 411001 && pincode <= 411053) || (pincode >= 700001 && pincode <= 700099) || (pincode >= 400601 && pincode <= 400608)) {
    return true;
  }
  return false;
}
exports.getdFormType = function(type) {
  if (type == 'string') return 'text';
  if (type == 'text') return 'textarea';
  if (type == 'json') return 'textarea';
  if (type == 'boolean') return 'radiobuttons';
  if (type == 'email') return 'text';
  if (type == 'float') return 'number';
  if (type == 'integer') return 'number';
}
exports.androidwidgetJSON = function(questionsJSON) {
  sails.log.debug("creating androidwidgetJSON");
  questionsJSON = _.sortBy(questionsJSON, function(question) {
    return question.order;
  }); //sorting according to order
  questionsJSON = _.groupBy(questionsJSON, function(question) {
    return question.page;
  }); //grouping according to page
  var result = [];
  var i = 0;
  //changing object to array of objects && deleting page and order
  _(questionsJSON)
    .forEach(function(pageArray) {
      _(pageArray)
        .forEach(function(ques) {
          if (ques.hasOwnProperty('professionProfileAnswer')) {
            //deleting unnecessary values
            delete ques.professionProfileAnswer.createdAt;
            delete ques.professionProfileAnswer.updatedAt;
            //renaming professionalProfileAnswer to answer
            var ans = ques.professionProfileAnswer; //storing it temporarily
            delete ques.professionProfileAnswer;
            ques.answer = ans;
          }
          delete ques.page;
          delete ques.order;
          // result[i] = ques;
          // i++;
        });
      result[i] = pageArray;
      i++;
    });
  return result;
}
exports.webwidgetJSON = function(questionsJSON) {
  sails.log.debug("creating webWidgets");
  questionsJSON = _.sortBy(questionsJSON, function(question) {
    return question.order;
  }); //sorting according to order
  for (var i = 0; i < questionsJSON.length; i++) {
    if (questionsJSON[i].hasOwnProperty('professionProfileAnswer')) {
      //deleting unnecessary values
      delete questionsJSON[i].professionProfileAnswer.createdAt;
      delete questionsJSON[i].professionProfileAnswer.updatedAt;
      delete questionsJSON[i].page;
      delete questionsJSON[i].order;
      //renaming professionalProfileAnswer to answer
      var ans = questionsJSON[i].professionProfileAnswer; //storing it temporarily
      delete questionsJSON[i].professionProfileAnswer;
      questionsJSON[i].answer = ans;
    }
  }
  return questionsJSON;
}
exports.webFormat = function(questionsJSON, callback) {
  questionsJSON = _.sortBy(questionsJSON, function(question) {
    return question.order;
  });
  //for web
  var questions = questionsJSON.map(function(questionJSON) {
    var wType;
    if (questionJSON.question.widgetType == "number") wType = 'number';
    else if (questionJSON.question.widgetType == 'dropdown') wType = 'select';
    else if (questionJSON.question.widgetType == 'radio_buttons') wType = 'radiobuttons';
    else if (questionJSON.question.widgetType == 'checkboxes') wType = 'checkboxes';
    else if (questionJSON.question.widgetType == 'single_line') wType = 'text';
    else if (questionJSON.question.widgetType == 'multi_line') wType = 'textarea';
    else if (questionJSON.question.widgetType == 'date_picker') {
      wType = 'text';
    } else wType = 'text';
    //formatiing options
    var opt = {};
    for (var i = 0; i < questionJSON.question.options.length; i++) {
      var key = questionJSON.question.options[i].key;
      var value = questionJSON.question.options[i].value;
      opt[key] = value;
    }
    if (questionJSON.question.widgetType == 'quote') {
      var valueObj = {
        "name": questionJSON.id,
        "type": "number",
        "caption": "value",
        "validate": {
          "required": true
        }
      };
      var unitObject = {
        "name": questionJSON.id,
        "type": "select",
        "caption": "unit",
        "options": opt
      }
      return [valueObj, unitObject];
    } else {
      var webquestionobject = {
        name: questionJSON.id,
        type: wType,
        caption: questionJSON.question.title,
        options: opt,
        placeholder: questionJSON.question.hint,
      };
      if (questionJSON.question.widgetType == 'date_picker') {
        webquestionobject.datepicker = {
          'minDate': '+1'
        };;
      }
      return [webquestionobject];
    }
    return webquestionobject
  });
  return _.reduce(questions, function(sofar, next) {
    return sofar.concat(next);
  }, []);
}
exports.androidFormat = function(questionsJSON, callback) {
  questionsJSON = _.sortBy(questionsJSON, function(question) {
    return question.order;
  });
  //for android
  var result = questionsJSON.map(function(questionJSON) {
    var obj = {
      key: questionJSON.id,
      caption: questionJSON.question.title,
      page: questionJSON.page,
      required: questionJSON.question.isRequired,
      name: questionJSON.question.name,
      hint: questionJSON.question.hint == null ? '' : questionJSON.question.hint,
    };
    if (questionJSON.question.widgetType == 'dropdown') {
      obj['type'] = 'select';
    } else if (questionJSON.question.widgetType == 'single_line') {
      obj['type'] = 'string';
    } else if (questionJSON.question.widgetType == 'quote') {
      obj['type'] = 'widget_set';
      obj["widgets"] = [{
        "key": "value",
        "type": "number",
        "weight": 2,
        "required": true
      }, {
        "key": "unit",
        "type": "select",
        "weight": 1,
        "required": true,
      }];
      obj["widgets"][1].options = _.map(questionJSON.question.options, function(option) {
        return {
          id: option.key,
          display: option.value
        }
      })
    } else {
      obj['type'] = questionJSON.question.widgetType;
    }
    if (questionJSON.question.options) {
      var transformedOptions = _.map(questionJSON.question.options, function(option) {
        return {
          id: option.key,
          display: option.value
        };
      });
      obj['options'] = transformedOptions;
    }
    return obj;
  });
  result = _.groupBy(result, function(question) {
    return question.page;
  });
  var fResult = [];
  var i = 0;
  _(result)
    .forEach(function(pageArray) {
      fResult[i] = pageArray;
      i++;
    });
  return fResult;
}
exports.questionAnswerTransform = function(questionFramewokAnswers) {
  var transformed = questionFramewokAnswers.map(function(questionFrameworkAnswer) {
    var obj = {
      key: questionFrameworkAnswer.questionFrameworkQuestions.question.name.split('_')[0],
      value: questionFrameworkAnswer.answer
    };
    if (questionFrameworkAnswer.questionFrameworkQuestions.question.widgetType == "quote") {
      //sails.log.verbose("quote", questionFrameworkAnswer.answer);
      obj.value = questionFrameworkAnswer.answer.split(",")[0];
      obj.unit = questionFrameworkAnswer.answer.split(",")[1];
    }
    return obj;
  });
  var reducedAns = _.reduce(transformed, function(sofar, item) {
    sofar[item.key] = item.value;
    if (item.unit) {
      sofar[item.key] = {};
      sofar[item.key]['value'] = item.value;
      sofar[item.key]['unit'] = item.unit;
    }
    return sofar;
  }, {});
  return reducedAns;
}
exports.capitalize = function(string) {
  return string.charAt(0)
    .toUpperCase() + string.slice(1)
    .toLowerCase();
}
exports.capitalizeSentence = function(string) {
  return string.toLowerCase()
    .split(' ')
    .map(exports.capitalize)
    .join(' ');
}
exports.toFixedDown = function(num, fixed) {
  fixed = fixed || 0;
  fixed = Math.pow(10, fixed);
  return Math.floor(num * fixed) / fixed;
}
exports.createField = function(question, dynamicJoinId, answer) {
  switch (question.type) {
    case "number":
      $ = cheerio.load("<input type='number'/>");
      break;
    case "text":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "textarea":
      $ = cheerio.load("<textarea></textarea>");
      break;
    case "Date":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "Time":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "DateTime":
      $ = cheerio.load("<input type='date'/>");
      break;
    case "Name":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "Mobile":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "Email":
      $ = cheerio.load("<input type='email'/>");
      break;
    case "Pincode":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "radiobuttons":
      $ = cheerio.load("<label>(" + question.hint + ")</label><div class='radio'></div>");
      var optionKeys = Object.keys(question.options);
      optionKeys.forEach(function(option) {
        //sails.log.verbose(question.options[option]);
        // sails.log.verbose("Option lowercase:",option.toLowerCase());
        $('.radio')
          .append("<label><input type='radio' value='" + option + "' name='" + dynamicJoinId + "' >" + question.options[option] + "</label><br>");
      });
      $('.radio')
        .attr('id', dynamicJoinId);
      $('.radio')
        .attr('name', question.name);
      break;
    case "checkboxes":
      $ = cheerio.load("<label>(" + question.hint + ")</label><div class='checkbox'></div>");
      var optionKeys = Object.keys(question.options);
      optionKeys.forEach(function(option) {
        $('.checkbox')
          .append("<label><input type='checkbox' value='" + option + "' name='" + dynamicJoinId + "' >" + question.options[option] + "</label><br>");
      });
      $('.checkbox')
        .attr('id', dynamicJoinId); //+ "checkbox"
      $('.checkbox')
        .attr('name', question.name);
      break;
    case "select":
      $ = cheerio.load('<select></select>');
      //  sails.log.verbose("Entering select switch",question.options);
      var optionKeys = Object.keys(question.options);
      optionKeys.forEach(function(option) {
        $('select')
          .append("<option value='" + option + "'>" + question.options[option] + "</option>");
      });
      $('select')
        .addClass('form-control');
      $('select')
        .attr('id', question.name);
      $('select')
        .attr('name', dynamicJoinId);
      $('select')
        .attr('placeholder', question.hint);
      break;
    case "Quote":
      $ = cheerio.load('<label>(' + question.hint + ')</label>' + '<div class="quote-widget input-group"></div>');
      $('.quote-widget')
        .append('<input class="quote-value" type="number">');
      $('.quote-widget')
        .append(' <span class="input-group-addon"><select class="quote-rate dropdown" name="quote-rate"></select></span>');
      question.options.forEach(function(option) {
        $('select')
          .append("<option value='" + option.key + "'>" + option.value + "</option>");
      });
      $('select')
        .attr('id', dynamicJoinId + "-quote-rate");
      $('select')
        .attr('name', dynamicJoinId + "-quote-rate");
      break;
    default:
      $ = cheerio.load("<input type='text' />");
      break;
  }
  if ($('input')
    .length == 1) {
    $('input')
      .addClass('form-control');
    $('input')
      .attr('id', question.name);
    $('input')
      .attr('name', dynamicJoinId);
    $('input')
      .attr('placeholder', question.hint);
  } else if ($('textarea')
    .length) {
    $('textarea')
      .addClass('form-control');
    $('textarea')
      .attr('id', question.name);
    $('textarea')
      .attr('Name', dynamicJoinId);
    $('textarea')
      .attr('placeholder', question.hint);
  }
  // check if answer was supplied and implement
  if (answer) {
    switch (question.type) {
      case "radiobuttons":
        $('input[value="' + answer + '"]')
          .attr('checked', true);
        break;
      case "checkboxes":
        answers = answer.split(',');
        answers.forEach(function(value) {
          $('input[value="' + value + '"]')
            .attr('checked', true);
        });
        break;
      case "select":
        $('option[value="' + answer + '"]')
          .attr('selected', true);
        break;
      case "Quote":
        var answerObj = JSON.parse(answer);
        $('.quote-value')
          .attr('value', answerObj.value);
        $('option[value="' + answerObj.rate + '"]')
          .attr('selected', true)
        break;
      case "textarea":
        $('textarea')
          .val(answer);
        break;
      default:
        $('input')
          .attr('value', answer);
        break;
    }
  }
  return $.html();
}
exports.createQuestionField = function(question) {
  if (question.hint == null) {
    question.hint = "No hint given to user"
  }
  switch (question.widgetType) {
    case "number":
      $ = cheerio.load("<input type='number'/>");
      break;
    case "text":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "textarea":
      $ = cheerio.load("<textarea></textarea>");
      break;
    case "Date":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "Time":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "DateTime":
      $ = cheerio.load("<input type='date'/>");
      break;
    case "Name":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "Mobile":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "Email":
      $ = cheerio.load("<input type='email'/>");
      break;
    case "Pincode":
      $ = cheerio.load("<input type='text'/>");
      break;
    case "radio_buttons":
      $ = cheerio.load("<label>(" + question.hint + ")</label><div class='radio'></div>");
      question.options.forEach(function(option) {
        $('.radio')
          .append("<label><input type='radio' value='" + option.key + "' name='' >" + option.value + "</label><br>");
      });
      $('.radio')
        .attr('name', question.name);
      break;
    case "checkboxes":
      $ = cheerio.load("<label>(" + question.hint + ")</label><div class='checkbox'></div>");
      question.options.forEach(function(option) {
        $('.checkbox')
          .append("<label><input type='checkbox' value='" + option.key + "' name='' >" + option.value + "</label><br>");
      });
      $('.checkbox')
        .attr('name', question.name);
      break;
    case "select":
      $ = cheerio.load('<select></select>');
      //  sails.log.verbose("Entering select switch",question.options);
      question.options.forEach(function(option) {
        $('select')
          .append("<option value='" + option.key + "'>" + option.value + "</option>");
      });
      $('select')
        .addClass('form-control');
      $('select')
        .attr('id', question.name);
      $('select')
        .attr('placeholder', question.hint);
      break;
    case "Quote":
      $ = cheerio.load('<label>(' + question.hint + ')</label>' + '<div class="quote-widget input-group"></div>');
      $('.quote-widget')
        .append('<input class="quote-value" type="number">');
      $('.quote-widget')
        .append(' <span class="input-group-addon"><select class="quote-rate dropdown" name="quote-rate"></select></span>');
      question.options.forEach(function(option) {
        $('select')
          .append("<option value='" + option.key + "'>" + option.value + "</option>");
      });
      break;
    default:
      $ = cheerio.load("<input type='text' />");
      break;
  }
  if ($('input')
    .length == 1) {
    $('input')
      .addClass('form-control');
    $('input')
      .attr('id', question.name);
    $('input')
      .attr('placeholder', question.hint);
  } else if ($('textarea')
    .length) {
    $('textarea')
      .addClass('form-control');
    $('textarea')
      .attr('id', question.name);
    $('textarea')
      .attr('placeholder', question.hint);
  }
  return $.html();
}
exports.createButton = function(row, modelName) {
  var buttons = sails.models[modelName.toLowerCase()]._instanceMethods.buttons();
  var routeString = "";
  _.forEach(buttons, function(button) {
    var keys = Object.keys(button);
    var route = button[keys[0]];
    var variable = route.substring(route.indexOf('<') + 1, route.indexOf('>'));
    var link = route.replace("<" + variable + ">", row[variable]);
    routeString += "<div style='padding:2px;'><a class = 'btn btn-medium btn-warning' href ='" + link + "'>" + keys[0] + "</a></div>";
  });
  $ = cheerio.load(routeString);
  return $.html();
}
exports.timeSince = function(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + " years ago";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months ago";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days ago";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours ago";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes ago";
  }
  return Math.floor(seconds) + " seconds";
}
exports.getAppType = function(appType) {
  if (appType == 'qyk-consumer-android') return 'android-consumer';
  else if (appType == 'qyk-professional-android') return 'android-professional';
  else if (appType == 'qyk-consumer-ios') return 'ios-consumer';
  else return 'android-consumer';
}
exports.operatorTester = function(op, val1, val2) {
  switch (op) {
    case '==':
      return val1 == val2;
      break;
    case '!=':
      return val1 != val2;
      break;
    case 'IN':
      return val1.indexOf(val2) != -1;
      break;
    default:
      return false;
  }
}
exports.getSMSKeys = function(str, ch1, ch2) {
  var strArr1 = str.split(ch1);
  var outputArray = [];
  for (var i = 1; i < strArr1.length; i++) {
    outputArray.push(strArr1[i].split(ch2)[0]);
  }
  return outputArray;
}
exports.getValueFromObject = function(obj, keys) {
  var keysArray = keys.split('.');
  var output = obj;
  for (var i = 0; i < keysArray.length; i++) {
    output = output[keysArray[i]];
  }
  return output;
}
exports.generateHash = function(s) {
  var hash = crypto.createHash('sha512');
  return hash.update(s)
    .digest('hex');
}
exports.generateHashString = function(params) {
  var payU = sails.config.payU;
  var amount = params.amount;
  amount = amount.toString()
    .slice(0, -2) + '.' + amount.toString()
    .slice(-2)
  return payU.key.concat('|', params.id, '|', amount, '|', params.productInfo, '|', params.name, '|', params.email, '|||||||||||', payU.salt);
}
exports.randomInt = function(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
exports.addToQuery = function(queryObj, exclude, queryType, objPath, queryField, queryValue) {
  if (exclude.indexOf(queryField) != -1) {
    var toPush = {};
    toPush[queryType] = {};
    toPush[queryType][objPath] = queryValue;
    queryObj.must_not.push(toPush);
    return queryObj;
  } else {
    var toPush = {};
    toPush[queryType] = {};
    toPush[queryType][objPath] = queryValue;
    queryObj.must.push(toPush);
    return queryObj;
  }
}
exports.addToNestedQuery = function(queryObj, exclude, queryType, objPath, queryField, queryValue) {
  var toPush = {};
  toPush[queryType] = {};
  toPush[queryType][objPath] = queryValue;
  if (exclude.indexOf(queryField) != -1) {
    queryObj.nested.query.bool.must_not.push(toPush);
  } else {
    queryObj.nested.query.bool.must.push(toPush);
  }
  if (queryField == 'primaryAssignee')
    queryObj.nested.query.bool.must.push({
      "match": {
        "assignment.role.raw": "PRIMARY"
      }
    });
  if (queryField == 'secondaryAssignee')
    queryObj.nested.query.bool.must.push({
      "match": {
        "assignment.role.raw": "SECONDARY"
      }
    });
  return queryObj;
}

exports.addToQuery2 = function(queryObj, exclude, queryType, objPath, queryField, queryValue) {
  if (exclude.indexOf(queryField) != -1) {
    for (var i = 0; i < queryValue.length; i++) {
      var toPush = {};
      toPush[queryType] = {};
      if (queryType === 'wildcard')
        toPush[queryType][objPath] = '*' + queryValue[i] + '*';
      if (queryType === 'match_phrase')
        toPush[queryType][objPath] = queryValue[i];
      queryObj.must_not.push(toPush);
    }
    return queryObj;
  } else {
    for (var i = 0; i < queryValue.length; i++) {
      var toPush = {};
      toPush[queryType] = {};
      if (queryType === 'wildcard')
        toPush[queryType][objPath] = '*' + queryValue[i] + '*';
      if (queryType === 'match_phrase')
        toPush[queryType][objPath] = queryValue[i];
      queryObj.should.push(toPush);
    }
    return queryObj;
  }
}

exports.formatReportsData = function(esResults, aggregateOn) {
  if (aggregateOn === "assignment.assignee.displayName.raw") {
    var data = _.map(esResults.aggregations.agg_count.filtered_nestedobjects.agg_count.buckets, function(agg1) {
      var data2 = _.map(agg1.enquiries_over_time.over_time.buckets, function(agg2) {
        var key = {};
        key.date = agg2.key_as_string;
        key.count = agg2.doc_count;
        return key;
      });
      return {
        "aggregateKey": agg1.key,
        "values": data2,
        "count": agg1.doc_count
      };
    });
  } else {
    var data = _.map(esResults.aggregations.agg_count.buckets, function(agg1) {
      var data2 = _.map(agg1.enquiries_over_time.buckets, function(agg2) {
        var key = {};
        key.date = agg2.key_as_string;
        key.count = agg2.doc_count;
        return key;
      });
      return {
        "aggregateKey": agg1.key,
        "values": data2,
        "count": agg1.doc_count
      };
    });
  }
  return data;
}

exports.getParamAsArray = function(param) {
  if (!param)
    return null;
  if (_.isString(param))
    return param.split(',');
  return param;
}
exports.neo4jClient = function() {
  return new neo4j.GraphDatabase('http://' + sails.config.neo4j.user + ':' + sails.config.neo4j.password + '@' + sails.config.neo4j.server + ':' + sails.config.neo4j.port);
}
exports.lpElasticsearchClient = function() {
  return new elasticsearch.Client({
    host: sails.config.elasticSearch.lp.host,
    apiVersion: '2.0',
    keepAlive: false,
  });
}
exports.opsElasticsearchClient = function() {
  return new elasticsearch.Client({
    host: sails.config.elasticSearch.ops.host,
    apiVersion: '2.0',
    keepAlive: false,
    // log: [{
    //   type: 'stdio',
    //   levels: ['error', 'warning', 'info', 'debug', 'trace']
    // }]
  });
}
exports.getUserDevice = function(userAgent) {
  var ua = uaParser(userAgent);
  var device = {
    type: ua.device.type,
    os: ua.os.name
  };
  return device;
}
exports.validateParam = function(definition, value) {
  switch (definition['type']) {
    case 'string':
      return _.isString(value);
    case 'enum':
      return definition.values.indexOf(value.toString()) !== -1;
    default:
      return false;
  }
}

// Return sum of values of given keys
// To use on objects returned by _.countBy
exports.sumOfCount = function(countBy, keys) {
  var total = 0;
  _.forEach(keys, function(key) {
    total += countBy[key] || 0;
  });

  return total;
}

exports.getImageDetailURL = function(images) {

    var imagesWithURL = [];

    _.each(images, function(image) {

      var imageWithURL = image;
      var url = '/photos/';
      var roomFeatures, materials;

      _.each(image.tags, function(tag) {

        if (tag.type === 'room-features') {
          roomFeatures = tag.slug;
        }
        if (tag.type === 'materials') {
          materials = tag.slug;
        }

      });

      var tagData = [];

      if (image.project.slug) {
        tagData.push(image.project.slug);
      }
      if (materials) {
        tagData.push(materials);
      }
      if (image.style) {
        tagData.push(image.style);
      }
      if (roomFeatures) {
        tagData.push(roomFeatures);
      }
      if (!roomFeatures && image.roomType) {
        tagData.push(image.roomType);
      }

      url += tagData.join('--');
      url += ('/' + image.name + '/pic');
      imageWithURL.url = url;

      imagesWithURL.push(imageWithURL);
    });
    return imagesWithURL;
  },

  exports.getPhotosDetailMetaTitle = function(image) {
    var materials = '';
    var roomFeatures = '';

    _.each(image.tags, function(tag) {

      if (tag.type === 'materials') {
        materials = tag.slug;
      }
      if (tag.type === 'room-features') {
        roomFeatures = tag.slug;
      }

    });

    var tags = '';
    if (materials.length > 0) {
      tags += (materials + ' ');
    }
    if (image.style) {
      tags += (image.style + ' ');
    }
    if (roomFeatures.length > 0) {
      tags += (roomFeatures + ' ');
    }
    if (roomFeatures.length == 0 && image.roomType) {
      tags += (image.roomType + ' ');
    }

    var metaArray = [];
    if (tags.length > 0) {
      metaArray.push(tags);
    }
    metaArray.push(image.project.name + ' ');
    metaArray.push('PaperToStone');
    var metaTitle = metaArray
      .join('| ');
    return metaTitle;
  },

  exports.getPhotosDetailMetaDescription = function(image) {

    var materials = '';
    var roomFeatures = '';

    _.each(image.tags, function(tag) {

      if (tag.type === 'materials') {
        materials = tag.slug;
      }
      if (tag.type === 'room-features') {
        roomFeatures = tag.slug;
      }

    });

    var tags = '';
    if (materials.length > 0) {
      tags += (materials + ' ');
    }
    if (image.style) {
      tags += (image.style + ' ');
    }
    if (roomFeatures.length > 0) {
      tags += (roomFeatures + ' ');
    }
    if (roomFeatures.length == 0 && image.roomType) {
      tags += (image.roomType + ' ');
    }

    var metaDescription = '';

    if (tags.length > 0) {
      metaDescription += (tags + 'photos in ');
    }
    metaDescription += (image.project.name + ' by ' + image.professional.displayName);
    if (image.professional.meta && image.professional.meta.city) {
      metaDescription += (' in ' + image.professional.meta.city);
    }
    return metaDescription;
  },

  exports.fromNow = function(input) {
    return moment(input)
      .fromNow();
  }

  exports.qpxMockResponse = function(){
     return {
     "kind": "qpxExpress#tripsSearch",
     "trips": {
      "kind": "qpxexpress#tripOptions",
      "requestId": "eqXnAdtgYffmaVp920Pa8j",
      "data": {
       "kind": "qpxexpress#data",
       "airport": [
        {
         "kind": "qpxexpress#airportData",
         "code": "AUH",
         "city": "AUH",
         "name": "Abu Dhabi International"
        },
        {
         "kind": "qpxexpress#airportData",
         "code": "BKK",
         "city": "BKK",
         "name": "Bangkok Suvarnabhumi International"
        },
        {
         "kind": "qpxexpress#airportData",
         "code": "BLR",
         "city": "BLR",
         "name": "Bengaluru Kempegowda International"
        },
        {
         "kind": "qpxexpress#airportData",
         "code": "BOM",
         "city": "BOM",
         "name": "Mumbai/Bombay Chhatrapati Shivaji Int'l"
        },
        {
         "kind": "qpxexpress#airportData",
         "code": "CCU",
         "city": "CCU",
         "name": "Kolkata/Calcutta Netaji Subhas Chandra"
        },
        {
         "kind": "qpxexpress#airportData",
         "code": "DEL",
         "city": "DEL",
         "name": "Delhi Indira Gandhi International"
        },
        {
         "kind": "qpxexpress#airportData",
         "code": "DXB",
         "city": "DXB",
         "name": "Dubai International"
        },
        {
         "kind": "qpxexpress#airportData",
         "code": "SIN",
         "city": "SIN",
         "name": "Singapore Changi"
        }
       ],
       "city": [
        {
         "kind": "qpxexpress#cityData",
         "code": "AUH",
         "name": "Abu Dhabi"
        },
        {
         "kind": "qpxexpress#cityData",
         "code": "BKK",
         "name": "Bangkok"
        },
        {
         "kind": "qpxexpress#cityData",
         "code": "BLR",
         "name": "Bangalore"
        },
        {
         "kind": "qpxexpress#cityData",
         "code": "BOM",
         "name": "Mumbai"
        },
        {
         "kind": "qpxexpress#cityData",
         "code": "CCU",
         "name": "Calcutta"
        },
        {
         "kind": "qpxexpress#cityData",
         "code": "DEL",
         "name": "Delhi"
        },
        {
         "kind": "qpxexpress#cityData",
         "code": "DXB",
         "name": "Dubai"
        },
        {
         "kind": "qpxexpress#cityData",
         "code": "SIN",
         "name": "Singapore"
        }
       ],
       "aircraft": [
        {
         "kind": "qpxexpress#aircraftData",
         "code": "319",
         "name": "Airbus A319"
        },
        {
         "kind": "qpxexpress#aircraftData",
         "code": "320",
         "name": "Airbus A320"
        },
        {
         "kind": "qpxexpress#aircraftData",
         "code": "321",
         "name": "Airbus A321"
        },
        {
         "kind": "qpxexpress#aircraftData",
         "code": "330",
         "name": "Airbus A330"
        },
        {
         "kind": "qpxexpress#aircraftData",
         "code": "332",
         "name": "Airbus A330"
        },
        {
         "kind": "qpxexpress#aircraftData",
         "code": "333",
         "name": "Airbus A330"
        },
        {
         "kind": "qpxexpress#aircraftData",
         "code": "738",
         "name": "Boeing 737"
        },
        {
         "kind": "qpxexpress#aircraftData",
         "code": "772",
         "name": "Boeing 777"
        },
        {
         "kind": "qpxexpress#aircraftData",
         "code": "788",
         "name": "Boeing 787"
        }
       ],
       "tax": [
        {
         "kind": "qpxexpress#taxData",
         "id": "F2_001",
         "name": "Indian Swachh Bharat Cess Service Tax"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "JN_004",
         "name": "Indian Service Tax"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "TP_001",
         "name": "United Arab Emirates Passenger Security And Safety Fee"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "IN",
         "name": "Indian User Development Fee"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "TS_001",
         "name": "Thailand Passenger Service Charge"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "OO_001",
         "name": "Singapore Passenger Security Service Charge"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "YR_F",
         "name": "EY YR surcharge"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "ZR_001",
         "name": "United Arab Emirates International Advanced Passenger Information Fee"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "G8_001",
         "name": "Thailand International Departure Fee"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "G8_002",
         "name": "Thailand International Arrival Fee"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "WO_001",
         "name": "Indian Passenger Service Fee"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "SG_001",
         "name": "Singapore Passenger Service And Security Charge"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "OP_001",
         "name": "Singapore Aviation Levy"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "E7_001",
         "name": "Thailand Advance Passenger Processing User Charge"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "YQ_F",
         "name": "EY YQ surcharge"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "G1_001",
         "name": "India Krishi Kalyan Cess"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "AE_004",
         "name": "United Arab Emirates Passenger Service Charge International"
        },
        {
         "kind": "qpxexpress#taxData",
         "id": "F6_002",
         "name": "United Arab Emirates Passenger Facilities Charge"
        }
       ],
       "carrier": [
        {
         "kind": "qpxexpress#carrierData",
         "code": "AI",
         "name": "Air India Limited"
        },
        {
         "kind": "qpxexpress#carrierData",
         "code": "EK",
         "name": "Emirates"
        },
        {
         "kind": "qpxexpress#carrierData",
         "code": "EY",
         "name": "Etihad Airways"
        },
        {
         "kind": "qpxexpress#carrierData",
         "code": "MI",
         "name": "SilkAir (S) Pte. Ltd."
        },
        {
         "kind": "qpxexpress#carrierData",
         "code": "TG",
         "name": "Thai Airways International Public"
        }
       ]
      },
      "tripOption": [
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR3313",
        "id": "KTzbbxXHx8CTqZsaHq32xD001",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 155,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 155,
            "flight": {
             "carrier": "AI",
             "number": "772"
            },
            "id": "GjtIUH8IMuUH9HoJ",
            "cabin": "COACH",
            "bookingCode": "S",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LewSTJ6g3rVcDLQB",
              "aircraft": "320",
              "arrivalTime": "2018-12-08T13:40+05:30",
              "departureTime": "2018-12-08T11:05+05:30",
              "origin": "BLR",
              "destination": "CCU",
              "duration": 155,
              "mileage": 960,
              "meal": "Snack or Brunch"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AmCc/K2UQi6sYkApha2nNnmpJLDJp5MdwtNpK+rdrhvFW",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "CCU",
            "basisCode": "SAP60"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AmCc/K2UQi6sYkApha2nNnmpJLDJp5MdwtNpK+rdrhvFW",
            "segmentId": "GjtIUH8IMuUH9HoJ"
           }
          ],
          "baseFareTotal": "INR2650",
          "saleFareTotal": "INR2650",
          "saleTaxTotal": "INR663",
          "saleTotal": "INR3313",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR149"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR6"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR6"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI CCU 2650SAP60 INR 2650 END XT 6F2 6G1 352IN 149JN 150WO",
          "latestTicketingTime": "2018-10-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5301",
        "id": "KTzbbxXHx8CTqZsaHq32xD006",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 625,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 165,
            "flight": {
             "carrier": "AI",
             "number": "804"
            },
            "id": "GZdRBaBwpx8Zw6pl",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "L8UDpvDKzOPes-R9",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T08:55+05:30",
              "departureTime": "2018-12-08T06:10+05:30",
              "origin": "BLR",
              "destination": "DEL",
              "destinationTerminal": "3",
              "duration": 165,
              "mileage": 1062,
              "meal": "Breakfast"
             }
            ],
            "connectionDuration": 330
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 130,
            "flight": {
             "carrier": "AI",
             "number": "20"
            },
            "id": "G15appI5FXxeZ1lg",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LrSLFEU4WduDctxo",
              "aircraft": "788",
              "arrivalTime": "2018-12-08T16:35+05:30",
              "departureTime": "2018-12-08T14:25+05:30",
              "origin": "DEL",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 130,
              "mileage": 815,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "DEL",
            "basisCode": "E90S2"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "carrier": "AI",
            "origin": "DEL",
            "destination": "CCU",
            "basisCode": "E90S2"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "segmentId": "GZdRBaBwpx8Zw6pl"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "segmentId": "G15appI5FXxeZ1lg"
           }
          ],
          "baseFareTotal": "INR4525",
          "saleFareTotal": "INR4525",
          "saleTaxTotal": "INR776",
          "saleTotal": "INR5301",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR254"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI DEL 2873E90S2 AI CCU 1649E90S2 INR 4522 END XT 10F2 10G1 352IN 254JN 150WO",
          "latestTicketingTime": "2018-09-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5301",
        "id": "KTzbbxXHx8CTqZsaHq32xD004",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 530,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 160,
            "flight": {
             "carrier": "AI",
             "number": "501"
            },
            "id": "GV8wwu3eTbl4pMWb",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LhRBOUj6HiAc7Meo",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T16:10+05:30",
              "departureTime": "2018-12-08T13:30+05:30",
              "origin": "BLR",
              "destination": "DEL",
              "destinationTerminal": "3",
              "duration": 160,
              "mileage": 1062,
              "meal": "Lunch"
             }
            ],
            "connectionDuration": 245
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 125,
            "flight": {
             "carrier": "AI",
             "number": "22"
            },
            "id": "GFHxIHjTOliJHrBW",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LBYYQeSOzXmY2Z4B",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T22:20+05:30",
              "departureTime": "2018-12-08T20:15+05:30",
              "origin": "DEL",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 125,
              "mileage": 815,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "DEL",
            "basisCode": "E90S2"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "carrier": "AI",
            "origin": "DEL",
            "destination": "CCU",
            "basisCode": "E90S2"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "segmentId": "GFHxIHjTOliJHrBW"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "segmentId": "GV8wwu3eTbl4pMWb"
           }
          ],
          "baseFareTotal": "INR4525",
          "saleFareTotal": "INR4525",
          "saleTaxTotal": "INR776",
          "saleTotal": "INR5301",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR254"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI DEL 2873E90S2 AI CCU 1649E90S2 INR 4522 END XT 10F2 10G1 352IN 254JN 150WO",
          "latestTicketingTime": "2018-09-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5301",
        "id": "KTzbbxXHx8CTqZsaHq32xD005",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 550,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 165,
            "flight": {
             "carrier": "AI",
             "number": "505"
            },
            "id": "G6t5p6jAeFr6XgLo",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LAEdXA7RL1KwY+UN",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T12:45+05:30",
              "departureTime": "2018-12-08T10:00+05:30",
              "origin": "BLR",
              "destination": "DEL",
              "destinationTerminal": "3",
              "duration": 165,
              "mileage": 1062,
              "meal": "Snack or Brunch"
             }
            ],
            "connectionDuration": 255
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 130,
            "flight": {
             "carrier": "AI",
             "number": "764"
            },
            "id": "GcXVbSXoNDgN+9zH",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LdzD4dpatD5s7sNl",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T19:10+05:30",
              "departureTime": "2018-12-08T17:00+05:30",
              "origin": "DEL",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 130,
              "mileage": 815,
              "meal": "Snack or Brunch"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "DEL",
            "basisCode": "E90S2"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "carrier": "AI",
            "origin": "DEL",
            "destination": "CCU",
            "basisCode": "E90S2"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "segmentId": "GcXVbSXoNDgN+9zH"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "segmentId": "G6t5p6jAeFr6XgLo"
           }
          ],
          "baseFareTotal": "INR4525",
          "saleFareTotal": "INR4525",
          "saleTaxTotal": "INR776",
          "saleTotal": "INR5301",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR254"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI DEL 2873E90S2 AI CCU 1649E90S2 INR 4522 END XT 10F2 10G1 352IN 254JN 150WO",
          "latestTicketingTime": "2018-09-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5301",
        "id": "KTzbbxXHx8CTqZsaHq32xD007",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 740,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 165,
            "flight": {
             "carrier": "AI",
             "number": "505"
            },
            "id": "G6t5p6jAeFr6XgLo",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LAEdXA7RL1KwY+UN",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T12:45+05:30",
              "departureTime": "2018-12-08T10:00+05:30",
              "origin": "BLR",
              "destination": "DEL",
              "destinationTerminal": "3",
              "duration": 165,
              "mileage": 1062,
              "meal": "Snack or Brunch"
             }
            ],
            "connectionDuration": 450
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 125,
            "flight": {
             "carrier": "AI",
             "number": "22"
            },
            "id": "GFHxIHjTOliJHrBW",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LBYYQeSOzXmY2Z4B",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T22:20+05:30",
              "departureTime": "2018-12-08T20:15+05:30",
              "origin": "DEL",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 125,
              "mileage": 815,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "DEL",
            "basisCode": "E90S2"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "carrier": "AI",
            "origin": "DEL",
            "destination": "CCU",
            "basisCode": "E90S2"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "segmentId": "GFHxIHjTOliJHrBW"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "segmentId": "G6t5p6jAeFr6XgLo"
           }
          ],
          "baseFareTotal": "INR4525",
          "saleFareTotal": "INR4525",
          "saleTaxTotal": "INR776",
          "saleTotal": "INR5301",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR254"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI DEL 2873E90S2 AI CCU 1649E90S2 INR 4522 END XT 10F2 10G1 352IN 254JN 150WO",
          "latestTicketingTime": "2018-09-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5301",
        "id": "KTzbbxXHx8CTqZsaHq32xD009",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 780,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 165,
            "flight": {
             "carrier": "AI",
             "number": "804"
            },
            "id": "GZdRBaBwpx8Zw6pl",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "L8UDpvDKzOPes-R9",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T08:55+05:30",
              "departureTime": "2018-12-08T06:10+05:30",
              "origin": "BLR",
              "destination": "DEL",
              "destinationTerminal": "3",
              "duration": 165,
              "mileage": 1062,
              "meal": "Breakfast"
             }
            ],
            "connectionDuration": 485
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 130,
            "flight": {
             "carrier": "AI",
             "number": "764"
            },
            "id": "GcXVbSXoNDgN+9zH",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LdzD4dpatD5s7sNl",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T19:10+05:30",
              "departureTime": "2018-12-08T17:00+05:30",
              "origin": "DEL",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 130,
              "mileage": 815,
              "meal": "Snack or Brunch"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "DEL",
            "basisCode": "E90S2"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "carrier": "AI",
            "origin": "DEL",
            "destination": "CCU",
            "basisCode": "E90S2"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "segmentId": "GcXVbSXoNDgN+9zH"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "segmentId": "GZdRBaBwpx8Zw6pl"
           }
          ],
          "baseFareTotal": "INR4525",
          "saleFareTotal": "INR4525",
          "saleTaxTotal": "INR776",
          "saleTotal": "INR5301",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR254"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI DEL 2873E90S2 AI CCU 1649E90S2 INR 4522 END XT 10F2 10G1 352IN 254JN 150WO",
          "latestTicketingTime": "2018-09-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5301",
        "id": "KTzbbxXHx8CTqZsaHq32xD003",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 395,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 165,
            "flight": {
             "carrier": "AI",
             "number": "505"
            },
            "id": "G6t5p6jAeFr6XgLo",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LAEdXA7RL1KwY+UN",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T12:45+05:30",
              "departureTime": "2018-12-08T10:00+05:30",
              "origin": "BLR",
              "destination": "DEL",
              "destinationTerminal": "3",
              "duration": 165,
              "mileage": 1062,
              "meal": "Snack or Brunch"
             }
            ],
            "connectionDuration": 100
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 130,
            "flight": {
             "carrier": "AI",
             "number": "20"
            },
            "id": "G15appI5FXxeZ1lg",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LrSLFEU4WduDctxo",
              "aircraft": "788",
              "arrivalTime": "2018-12-08T16:35+05:30",
              "departureTime": "2018-12-08T14:25+05:30",
              "origin": "DEL",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 130,
              "mileage": 815,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "DEL",
            "basisCode": "E90S2"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "carrier": "AI",
            "origin": "DEL",
            "destination": "CCU",
            "basisCode": "E90S2"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AfL9BzfT89fXmi1jYMCWoUUea3ErgPIFLA2/b0W5Y02oV",
            "segmentId": "G6t5p6jAeFr6XgLo"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "segmentId": "G15appI5FXxeZ1lg"
           }
          ],
          "baseFareTotal": "INR4525",
          "saleFareTotal": "INR4525",
          "saleTaxTotal": "INR776",
          "saleTotal": "INR5301",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR254"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR10"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI X/DEL 2873E90S2 AI CCU 1649E90S2 INR 4522 END XT 10F2 10G1 352IN 254JN 150WO",
          "latestTicketingTime": "2018-09-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5910",
        "id": "KTzbbxXHx8CTqZsaHq32xD002",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 355,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 100,
            "flight": {
             "carrier": "AI",
             "number": "608"
            },
            "id": "Gq+X4oijVJJ5ZH65",
            "cabin": "COACH",
            "bookingCode": "S",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "Lh3eaEvmmyUy1LiR",
              "aircraft": "320",
              "arrivalTime": "2018-12-08T19:00+05:30",
              "departureTime": "2018-12-08T17:20+05:30",
              "origin": "BLR",
              "destination": "BOM",
              "destinationTerminal": "2",
              "duration": 100,
              "mileage": 518,
              "meal": "Snack or Brunch"
             }
            ],
            "connectionDuration": 110
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 145,
            "flight": {
             "carrier": "AI",
             "number": "774"
            },
            "id": "GArEhaFqxT7rGyML",
            "cabin": "COACH",
            "bookingCode": "S",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LT3XqX+BFiBm1edC",
              "aircraft": "319",
              "arrivalTime": "2018-12-08T23:15+05:30",
              "departureTime": "2018-12-08T20:50+05:30",
              "origin": "BOM",
              "destination": "CCU",
              "originTerminal": "2",
              "duration": 145,
              "mileage": 1034,
              "meal": "Dinner"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AKGmqrJIzzSo930cSHZsXxwsjGcDyjAnwIGSZqxSFJNky",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "BOM",
            "basisCode": "SAP60"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "Ah5sXUlDxik7ErOTVVFe2BtLb0uvIEyQGz8R4gGWT3JxR",
            "carrier": "AI",
            "origin": "BOM",
            "destination": "CCU",
            "basisCode": "SAP60"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AKGmqrJIzzSo930cSHZsXxwsjGcDyjAnwIGSZqxSFJNky",
            "segmentId": "Gq+X4oijVJJ5ZH65"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "Ah5sXUlDxik7ErOTVVFe2BtLb0uvIEyQGz8R4gGWT3JxR",
            "segmentId": "GArEhaFqxT7rGyML"
           }
          ],
          "baseFareTotal": "INR5100",
          "saleFareTotal": "INR5100",
          "saleTaxTotal": "INR810",
          "saleTotal": "INR5910",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR286"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR11"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR11"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI X/BOM 1750SAP60 AI CCU 3350SAP60 INR 5100 END XT 11F2 11G1 352IN 286JN 150WO",
          "latestTicketingTime": "2018-10-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5926",
        "id": "KTzbbxXHx8CTqZsaHq32xD00A",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 620,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 100,
            "flight": {
             "carrier": "AI",
             "number": "604"
            },
            "id": "GHbHoefZwWJSPnYg",
            "cabin": "COACH",
            "bookingCode": "S",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LbFIa2YY9g34iWI7",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T10:30+05:30",
              "departureTime": "2018-12-08T08:50+05:30",
              "origin": "BLR",
              "destination": "BOM",
              "destinationTerminal": "2",
              "duration": 100,
              "mileage": 518,
              "meal": "Breakfast"
             }
            ],
            "connectionDuration": 150
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 125,
            "flight": {
             "carrier": "AI",
             "number": "677"
            },
            "id": "GKFYnCGc7qFKp6ji",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LES2kzMFngxC5tAI",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T15:05+05:30",
              "departureTime": "2018-12-08T13:00+05:30",
              "origin": "BOM",
              "destination": "DEL",
              "originTerminal": "2",
              "destinationTerminal": "3",
              "duration": 125,
              "mileage": 706,
              "meal": "Snack or Brunch"
             }
            ],
            "connectionDuration": 115
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 130,
            "flight": {
             "carrier": "AI",
             "number": "764"
            },
            "id": "GcXVbSXoNDgN+9zH",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "2",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LdzD4dpatD5s7sNl",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T19:10+05:30",
              "departureTime": "2018-12-08T17:00+05:30",
              "origin": "DEL",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 130,
              "mileage": 815,
              "meal": "Snack or Brunch"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AKGmqrJIzzSo930cSHZsXxwsjGcDyjAnwIGSZqxSFJNky",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "BOM",
            "basisCode": "SAP60"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AQ0rxfELr2UKdr/8lpR8diIrGEWqTdFkoKAf7SDFcIRm4",
            "carrier": "AI",
            "origin": "BOM",
            "destination": "DEL",
            "basisCode": "E90S2"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "carrier": "AI",
            "origin": "DEL",
            "destination": "CCU",
            "basisCode": "E90S2"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AQ0rxfELr2UKdr/8lpR8diIrGEWqTdFkoKAf7SDFcIRm4",
            "segmentId": "GKFYnCGc7qFKp6ji"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AKGmqrJIzzSo930cSHZsXxwsjGcDyjAnwIGSZqxSFJNky",
            "segmentId": "GHbHoefZwWJSPnYg"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "segmentId": "GcXVbSXoNDgN+9zH"
           }
          ],
          "baseFareTotal": "INR5115",
          "saleFareTotal": "INR5115",
          "saleTaxTotal": "INR811",
          "saleTotal": "INR5926",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR287"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR11"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR11"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI X/BOM 1750SAP60 AI X/DEL 1712E90S2 AI CCU 1649E90S2 INR 5111 END XT 11F2 11G1 352IN 287JN 150WO",
          "latestTicketingTime": "2018-09-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR5926",
        "id": "KTzbbxXHx8CTqZsaHq32xD008",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 590,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 95,
            "flight": {
             "carrier": "AI",
             "number": "640"
            },
            "id": "GYAdTqC6SB64Ctb1",
            "cabin": "COACH",
            "bookingCode": "S",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "L5DS5Ski1wjggXdE",
              "aircraft": "319",
              "arrivalTime": "2018-12-08T08:20+05:30",
              "departureTime": "2018-12-08T06:45+05:30",
              "origin": "BLR",
              "destination": "BOM",
              "destinationTerminal": "2",
              "duration": 95,
              "mileage": 518,
              "meal": "Snack or Brunch"
             }
            ],
            "connectionDuration": 100
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 135,
            "flight": {
             "carrier": "AI",
             "number": "809"
            },
            "id": "G-WAzz5B3FTEXRnL",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LAfFSnBK+xhqz3TV",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T12:15+05:30",
              "departureTime": "2018-12-08T10:00+05:30",
              "origin": "BOM",
              "destination": "DEL",
              "originTerminal": "2",
              "destinationTerminal": "3",
              "duration": 135,
              "mileage": 706,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 130
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 130,
            "flight": {
             "carrier": "AI",
             "number": "20"
            },
            "id": "G15appI5FXxeZ1lg",
            "cabin": "COACH",
            "bookingCode": "E",
            "bookingCodeCount": 9,
            "marriedSegmentGroup": "2",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LrSLFEU4WduDctxo",
              "aircraft": "788",
              "arrivalTime": "2018-12-08T16:35+05:30",
              "departureTime": "2018-12-08T14:25+05:30",
              "origin": "DEL",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 130,
              "mileage": 815,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AKGmqrJIzzSo930cSHZsXxwsjGcDyjAnwIGSZqxSFJNky",
            "carrier": "AI",
            "origin": "BLR",
            "destination": "BOM",
            "basisCode": "SAP60"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AQ0rxfELr2UKdr/8lpR8diIrGEWqTdFkoKAf7SDFcIRm4",
            "carrier": "AI",
            "origin": "BOM",
            "destination": "DEL",
            "basisCode": "E90S2"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "carrier": "AI",
            "origin": "DEL",
            "destination": "CCU",
            "basisCode": "E90S2"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AKGmqrJIzzSo930cSHZsXxwsjGcDyjAnwIGSZqxSFJNky",
            "segmentId": "GYAdTqC6SB64Ctb1"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AQ0rxfELr2UKdr/8lpR8diIrGEWqTdFkoKAf7SDFcIRm4",
            "segmentId": "G-WAzz5B3FTEXRnL"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMF+ZAKvoGkspSf/iy+UBuBYotQyn39yq69Et3ajvVwzE",
            "segmentId": "G15appI5FXxeZ1lg"
           }
          ],
          "baseFareTotal": "INR5115",
          "saleFareTotal": "INR5115",
          "saleTaxTotal": "INR811",
          "saleTotal": "INR5926",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR287"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR11"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR11"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR352"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           }
          ],
          "fareCalculation": "BLR AI X/BOM 1750SAP60 AI X/DEL 1712E90S2 AI CCU 1649E90S2 INR 5111 END XT 11F2 11G1 352IN 287JN 150WO",
          "latestTicketingTime": "2018-09-09T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR23401",
        "id": "KTzbbxXHx8CTqZsaHq32xD00B",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 605,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 260,
            "flight": {
             "carrier": "EY",
             "number": "287"
            },
            "id": "G1XA2GZz4F09OaKx",
            "cabin": "COACH",
            "bookingCode": "T",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LTs8T5avpoxhvIKq",
              "aircraft": "321",
              "arrivalTime": "2018-12-08T12:40+04:00",
              "departureTime": "2018-12-08T09:50+05:30",
              "origin": "BLR",
              "destination": "AUH",
              "destinationTerminal": "1",
              "duration": 260,
              "mileage": 1691,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 75
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 270,
            "flight": {
             "carrier": "EY",
             "number": "256"
            },
            "id": "GMlCOzqRveKrtdJt",
            "cabin": "COACH",
            "bookingCode": "T",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LGIENx82fPwS+aO-",
              "aircraft": "320",
              "arrivalTime": "2018-12-08T19:55+05:30",
              "departureTime": "2018-12-08T13:55+04:00",
              "origin": "AUH",
              "destination": "CCU",
              "originTerminal": "1",
              "duration": 270,
              "mileage": 2138,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AcOcIrJLqQF2V2bKVz23oK0iWs0Fb39hMs3bhX416FTM",
            "carrier": "EY",
            "origin": "BLR",
            "destination": "AUH",
            "basisCode": "THOTRTEY/YB"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "Ac+GtXBMrDENBA6+C2zqpDeRKED0ZhUicTXd/eMgze1U",
            "carrier": "EY",
            "origin": "AUH",
            "destination": "CCU",
            "basisCode": "THOTRTEY/YB"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AcOcIrJLqQF2V2bKVz23oK0iWs0Fb39hMs3bhX416FTM",
            "segmentId": "G1XA2GZz4F09OaKx"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "Ac+GtXBMrDENBA6+C2zqpDeRKED0ZhUicTXd/eMgze1U",
            "segmentId": "GMlCOzqRveKrtdJt"
           }
          ],
          "baseFareTotal": "INR10115",
          "saleFareTotal": "INR10115",
          "saleTaxTotal": "INR13286",
          "saleTotal": "INR23401",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR567"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR22"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR22"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F6_002",
            "chargeType": "GOVERNMENT",
            "code": "F6",
            "country": "AE",
            "salePrice": "INR650"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR8174"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR470"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YR_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YR",
            "salePrice": "INR75"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "TP_001",
            "chargeType": "GOVERNMENT",
            "code": "TP",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "AE_004",
            "chargeType": "GOVERNMENT",
            "code": "AE",
            "country": "AE",
            "salePrice": "INR1391"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YR_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YR",
            "salePrice": "INR137"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "ZR_001",
            "chargeType": "GOVERNMENT",
            "code": "ZR",
            "country": "AE",
            "salePrice": "INR93"
           }
          ],
          "fareCalculation": "BLR EY X/AUH Q25.00 60.51THOTRTEY EY CCU 66.60THOTRTEY NUC 152.11 END ROE 66.4751 FARE INR 10115 XT 38F2 38G1 1410IN 1037JN 150WO 1391AE 650F6 93TP 93ZR 8174YQ 212YR",
          "latestTicketingTime": "2016-12-08T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR29197",
        "id": "KTzbbxXHx8CTqZsaHq32xD00G",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 1340,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 260,
            "flight": {
             "carrier": "EY",
             "number": "237"
            },
            "id": "GjwGrdnGvn4pf-qg",
            "cabin": "COACH",
            "bookingCode": "L",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LG-vfdZ0D78RLCIU",
              "aircraft": "321",
              "arrivalTime": "2018-12-09T00:25+04:00",
              "departureTime": "2018-12-08T21:35+05:30",
              "origin": "BLR",
              "destination": "AUH",
              "destinationTerminal": "1",
              "duration": 260,
              "mileage": 1691,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 810
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 270,
            "flight": {
             "carrier": "EY",
             "number": "256"
            },
            "id": "GpeQbWHU-nNw+SkD",
            "cabin": "COACH",
            "bookingCode": "T",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LRS7sjtEME9QKwmR",
              "aircraft": "320",
              "arrivalTime": "2018-12-09T19:55+05:30",
              "departureTime": "2018-12-09T13:55+04:00",
              "origin": "AUH",
              "destination": "CCU",
              "originTerminal": "1",
              "duration": 270,
              "mileage": 2138,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AMySWJMf3QqTdmNijnj2gQJK3LdAdRddoGb7M0eOt5fc",
            "carrier": "EY",
            "origin": "BLR",
            "destination": "AUH",
            "basisCode": "LLEE6MEY/YV"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "Ac+GtXBMrDENBA6+C2zqpDeRKED0ZhUicTXd/eMgze1U",
            "carrier": "EY",
            "origin": "AUH",
            "destination": "CCU",
            "basisCode": "THOTRTEY/YB"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "Ac+GtXBMrDENBA6+C2zqpDeRKED0ZhUicTXd/eMgze1U",
            "segmentId": "GpeQbWHU-nNw+SkD"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AMySWJMf3QqTdmNijnj2gQJK3LdAdRddoGb7M0eOt5fc",
            "segmentId": "GjwGrdnGvn4pf-qg"
           }
          ],
          "baseFareTotal": "INR15585",
          "saleFareTotal": "INR15585",
          "saleTaxTotal": "INR13612",
          "saleTotal": "INR29197",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR873"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR32"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR32"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F6_002",
            "chargeType": "GOVERNMENT",
            "code": "F6",
            "country": "AE",
            "salePrice": "INR650"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR8174"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR470"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YR_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YR",
            "salePrice": "INR75"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "TP_001",
            "chargeType": "GOVERNMENT",
            "code": "TP",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "AE_004",
            "chargeType": "GOVERNMENT",
            "code": "AE",
            "country": "AE",
            "salePrice": "INR1391"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "ZR_001",
            "chargeType": "GOVERNMENT",
            "code": "ZR",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YR_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YR",
            "salePrice": "INR137"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           }
          ],
          "fareCalculation": "BLR EY X/AUH Q25.00 142.83LLEE6MEY EY CCU 66.60THOTRTEY NUC 234.43 END ROE 66.4751 FARE INR 15585 XT 48F2 48G1 1410IN 1343JN 150WO 1391AE 650F6 93TP 93ZR 8174YQ 212YR",
          "latestTicketingTime": "2016-12-08T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR31894",
        "id": "KTzbbxXHx8CTqZsaHq32xD00F",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 1275,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 245,
            "flight": {
             "carrier": "EK",
             "number": "565"
            },
            "id": "GZToqoBXKzGHZIxR",
            "cabin": "COACH",
            "bookingCode": "V",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LD99-TQbMVOQkPAJ",
              "aircraft": "332",
              "arrivalTime": "2018-12-08T13:00+04:00",
              "departureTime": "2018-12-08T10:25+05:30",
              "origin": "BLR",
              "destination": "DXB",
              "destinationTerminal": "3",
              "duration": 245,
              "mileage": 1673,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 775
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 255,
            "flight": {
             "carrier": "EK",
             "number": "570"
            },
            "id": "GGt6L3ubkb87BWVk",
            "cabin": "COACH",
            "bookingCode": "U",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LQi4M6rm7wCqyhFp",
              "aircraft": "332",
              "arrivalTime": "2018-12-09T07:40+05:30",
              "departureTime": "2018-12-09T01:55+04:00",
              "origin": "DXB",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 255,
              "mileage": 2090,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "carrier": "EK",
            "origin": "BLR",
            "destination": "DXB",
            "basisCode": "VLWEPIN1"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "carrier": "EK",
            "origin": "DXB",
            "destination": "CCU",
            "basisCode": "ULWESIN1"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "segmentId": "GGt6L3ubkb87BWVk"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "segmentId": "GZToqoBXKzGHZIxR"
           }
          ],
          "baseFareTotal": "INR18340",
          "saleFareTotal": "INR18340",
          "saleTaxTotal": "INR13554",
          "saleTotal": "INR31894",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR1027"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F6_002",
            "chargeType": "GOVERNMENT",
            "code": "F6",
            "country": "AE",
            "salePrice": "INR650"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR8174"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR458"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "TP_001",
            "chargeType": "GOVERNMENT",
            "code": "TP",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "AE_004",
            "chargeType": "GOVERNMENT",
            "code": "AE",
            "country": "AE",
            "salePrice": "INR1391"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "ZR_001",
            "chargeType": "GOVERNMENT",
            "code": "ZR",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           }
          ],
          "fareCalculation": "BLR EK X/DXB 99.21VLWEPIN1 EK CCU 176.68ULWESIN1 NUC 275.89 END ROE 66.4751 FARE INR 18340 XT 54F2 54G1 1410IN 1485JN 150WO 1391AE 650F6 93TP 93ZR 8174YQ",
          "latestTicketingTime": "2017-01-06T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR31894",
        "id": "KTzbbxXHx8CTqZsaHq32xD00D",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 900,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 245,
            "flight": {
             "carrier": "EK",
             "number": "569"
            },
            "id": "Gnww3NfUlShmt7O5",
            "cabin": "COACH",
            "bookingCode": "V",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LTCpdaSWHgW+kEVT",
              "aircraft": "332",
              "arrivalTime": "2018-12-08T06:50+04:00",
              "departureTime": "2018-12-08T04:15+05:30",
              "origin": "BLR",
              "destination": "DXB",
              "destinationTerminal": "3",
              "duration": 245,
              "mileage": 1673,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 405
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 250,
            "flight": {
             "carrier": "EK",
             "number": "572"
            },
            "id": "GPVD4mVXVhWi-ZFa",
            "cabin": "COACH",
            "bookingCode": "U",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LUhOcokdSllTyv75",
              "aircraft": "772",
              "arrivalTime": "2018-12-08T19:15+05:30",
              "departureTime": "2018-12-08T13:35+04:00",
              "origin": "DXB",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 250,
              "mileage": 2090,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "carrier": "EK",
            "origin": "BLR",
            "destination": "DXB",
            "basisCode": "VLWEPIN1"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "carrier": "EK",
            "origin": "DXB",
            "destination": "CCU",
            "basisCode": "ULWESIN1"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "segmentId": "GPVD4mVXVhWi-ZFa"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "segmentId": "Gnww3NfUlShmt7O5"
           }
          ],
          "baseFareTotal": "INR18340",
          "saleFareTotal": "INR18340",
          "saleTaxTotal": "INR13554",
          "saleTotal": "INR31894",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR1027"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F6_002",
            "chargeType": "GOVERNMENT",
            "code": "F6",
            "country": "AE",
            "salePrice": "INR650"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR8174"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR458"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "TP_001",
            "chargeType": "GOVERNMENT",
            "code": "TP",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "AE_004",
            "chargeType": "GOVERNMENT",
            "code": "AE",
            "country": "AE",
            "salePrice": "INR1391"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "ZR_001",
            "chargeType": "GOVERNMENT",
            "code": "ZR",
            "country": "AE",
            "salePrice": "INR93"
           }
          ],
          "fareCalculation": "BLR EK X/DXB 99.21VLWEPIN1 EK CCU 176.68ULWESIN1 NUC 275.89 END ROE 66.4751 FARE INR 18340 XT 54F2 54G1 1410IN 1485JN 150WO 1391AE 650F6 93TP 93ZR 8174YQ",
          "latestTicketingTime": "2017-01-06T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR31894",
        "id": "KTzbbxXHx8CTqZsaHq32xD00C",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 790,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 245,
            "flight": {
             "carrier": "EK",
             "number": "567"
            },
            "id": "GMYUjPlD3sFsqHbm",
            "cabin": "COACH",
            "bookingCode": "V",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LMAaOB+rVW+lyUmg",
              "aircraft": "332",
              "arrivalTime": "2018-12-08T21:05+04:00",
              "departureTime": "2018-12-08T18:30+05:30",
              "origin": "BLR",
              "destination": "DXB",
              "destinationTerminal": "3",
              "duration": 245,
              "mileage": 1673,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 290
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 255,
            "flight": {
             "carrier": "EK",
             "number": "570"
            },
            "id": "GGt6L3ubkb87BWVk",
            "cabin": "COACH",
            "bookingCode": "U",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LQi4M6rm7wCqyhFp",
              "aircraft": "332",
              "arrivalTime": "2018-12-09T07:40+05:30",
              "departureTime": "2018-12-09T01:55+04:00",
              "origin": "DXB",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 255,
              "mileage": 2090,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "carrier": "EK",
            "origin": "BLR",
            "destination": "DXB",
            "basisCode": "VLWEPIN1"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "carrier": "EK",
            "origin": "DXB",
            "destination": "CCU",
            "basisCode": "ULWESIN1"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "segmentId": "GGt6L3ubkb87BWVk"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "segmentId": "GMYUjPlD3sFsqHbm"
           }
          ],
          "baseFareTotal": "INR18340",
          "saleFareTotal": "INR18340",
          "saleTaxTotal": "INR13554",
          "saleTotal": "INR31894",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR1027"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F6_002",
            "chargeType": "GOVERNMENT",
            "code": "F6",
            "country": "AE",
            "salePrice": "INR650"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR8174"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR458"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "TP_001",
            "chargeType": "GOVERNMENT",
            "code": "TP",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "AE_004",
            "chargeType": "GOVERNMENT",
            "code": "AE",
            "country": "AE",
            "salePrice": "INR1391"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "ZR_001",
            "chargeType": "GOVERNMENT",
            "code": "ZR",
            "country": "AE",
            "salePrice": "INR93"
           }
          ],
          "fareCalculation": "BLR EK X/DXB 99.21VLWEPIN1 EK CCU 176.68ULWESIN1 NUC 275.89 END ROE 66.4751 FARE INR 18340 XT 54F2 54G1 1410IN 1485JN 150WO 1391AE 650F6 93TP 93ZR 8174YQ",
          "latestTicketingTime": "2017-01-06T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR31894",
        "id": "KTzbbxXHx8CTqZsaHq32xD00J",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 1645,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 245,
            "flight": {
             "carrier": "EK",
             "number": "569"
            },
            "id": "Gnww3NfUlShmt7O5",
            "cabin": "COACH",
            "bookingCode": "V",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LTCpdaSWHgW+kEVT",
              "aircraft": "332",
              "arrivalTime": "2018-12-08T06:50+04:00",
              "departureTime": "2018-12-08T04:15+05:30",
              "origin": "BLR",
              "destination": "DXB",
              "destinationTerminal": "3",
              "duration": 245,
              "mileage": 1673,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 1145
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 255,
            "flight": {
             "carrier": "EK",
             "number": "570"
            },
            "id": "GGt6L3ubkb87BWVk",
            "cabin": "COACH",
            "bookingCode": "U",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LQi4M6rm7wCqyhFp",
              "aircraft": "332",
              "arrivalTime": "2018-12-09T07:40+05:30",
              "departureTime": "2018-12-09T01:55+04:00",
              "origin": "DXB",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 255,
              "mileage": 2090,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "carrier": "EK",
            "origin": "BLR",
            "destination": "DXB",
            "basisCode": "VLWEPIN1"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "carrier": "EK",
            "origin": "DXB",
            "destination": "CCU",
            "basisCode": "ULWESIN1"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "segmentId": "GGt6L3ubkb87BWVk"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "segmentId": "Gnww3NfUlShmt7O5"
           }
          ],
          "baseFareTotal": "INR18340",
          "saleFareTotal": "INR18340",
          "saleTaxTotal": "INR13554",
          "saleTotal": "INR31894",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR1027"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F6_002",
            "chargeType": "GOVERNMENT",
            "code": "F6",
            "country": "AE",
            "salePrice": "INR650"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR8174"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR458"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "TP_001",
            "chargeType": "GOVERNMENT",
            "code": "TP",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "AE_004",
            "chargeType": "GOVERNMENT",
            "code": "AE",
            "country": "AE",
            "salePrice": "INR1391"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "ZR_001",
            "chargeType": "GOVERNMENT",
            "code": "ZR",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           }
          ],
          "fareCalculation": "BLR EK X/DXB 99.21VLWEPIN1 EK CCU 176.68ULWESIN1 NUC 275.89 END ROE 66.4751 FARE INR 18340 XT 54F2 54G1 1410IN 1485JN 150WO 1391AE 650F6 93TP 93ZR 8174YQ",
          "latestTicketingTime": "2017-01-06T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR31894",
        "id": "KTzbbxXHx8CTqZsaHq32xD00H",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 1485,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 245,
            "flight": {
             "carrier": "EK",
             "number": "567"
            },
            "id": "GMYUjPlD3sFsqHbm",
            "cabin": "COACH",
            "bookingCode": "V",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LMAaOB+rVW+lyUmg",
              "aircraft": "332",
              "arrivalTime": "2018-12-08T21:05+04:00",
              "departureTime": "2018-12-08T18:30+05:30",
              "origin": "BLR",
              "destination": "DXB",
              "destinationTerminal": "3",
              "duration": 245,
              "mileage": 1673,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 990
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 250,
            "flight": {
             "carrier": "EK",
             "number": "572"
            },
            "id": "G15wC3Y-9kebTFba",
            "cabin": "COACH",
            "bookingCode": "U",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LbAVoBxKYgS1sKmA",
              "aircraft": "772",
              "arrivalTime": "2018-12-09T19:15+05:30",
              "departureTime": "2018-12-09T13:35+04:00",
              "origin": "DXB",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 250,
              "mileage": 2090,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "carrier": "EK",
            "origin": "BLR",
            "destination": "DXB",
            "basisCode": "VLWEPIN1"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "carrier": "EK",
            "origin": "DXB",
            "destination": "CCU",
            "basisCode": "ULWESIN1"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A5Ut8L2FTpLj68CGkQWq96zz6HxvrqJDj+PN2BWhxM8k",
            "segmentId": "G15wC3Y-9kebTFba"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "ATlZxgHsQb/LQZisFl0x7LKegIQFaO7OnH5N8TIJ7weQ",
            "segmentId": "GMYUjPlD3sFsqHbm"
           }
          ],
          "baseFareTotal": "INR18340",
          "saleFareTotal": "INR18340",
          "saleTaxTotal": "INR13554",
          "saleTotal": "INR31894",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR1027"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F6_002",
            "chargeType": "GOVERNMENT",
            "code": "F6",
            "country": "AE",
            "salePrice": "INR650"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR8174"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR458"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR16"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "TP_001",
            "chargeType": "GOVERNMENT",
            "code": "TP",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "AE_004",
            "chargeType": "GOVERNMENT",
            "code": "AE",
            "country": "AE",
            "salePrice": "INR1391"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "ZR_001",
            "chargeType": "GOVERNMENT",
            "code": "ZR",
            "country": "AE",
            "salePrice": "INR93"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           }
          ],
          "fareCalculation": "BLR EK X/DXB 99.21VLWEPIN1 EK CCU 176.68ULWESIN1 NUC 275.89 END ROE 66.4751 FARE INR 18340 XT 54F2 54G1 1410IN 1485JN 150WO 1391AE 650F6 93TP 93ZR 8174YQ",
          "latestTicketingTime": "2017-01-06T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR38926",
        "id": "KTzbbxXHx8CTqZsaHq32xD00I",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 1410,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 270,
            "flight": {
             "carrier": "MI",
             "number": "5843"
            },
            "id": "GNehALVLSmXwJvB7",
            "cabin": "COACH",
            "bookingCode": "W",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "L1qpmQlfN1263w0X",
              "aircraft": "772",
              "arrivalTime": "2018-12-09T06:10+08:00",
              "departureTime": "2018-12-08T23:10+05:30",
              "origin": "BLR",
              "destination": "SIN",
              "destinationTerminal": "0",
              "duration": 270,
              "operatingDisclosure": "OPERATED BY SINGAPORE AIRLINES",
              "mileage": 1974,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 885
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 255,
            "flight": {
             "carrier": "MI",
             "number": "488"
            },
            "id": "GLkJy6cZO+f-GQ3b",
            "cabin": "COACH",
            "bookingCode": "W",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LVETIFTHy1Hp2spq",
              "aircraft": "738",
              "arrivalTime": "2018-12-09T22:40+05:30",
              "departureTime": "2018-12-09T20:55+08:00",
              "origin": "SIN",
              "destination": "CCU",
              "originTerminal": "2",
              "duration": 255,
              "mileage": 1803,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A8c9zPzNI1emHRxGQo7joRoJT7Ni7wOhSxNiXZ5/6vYo",
            "carrier": "MI",
            "origin": "BLR",
            "destination": "SIN",
            "basisCode": "WEII3M"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A3bo54TZtAVWPI39URPp66Hy1bH8Sfv0uHGLK6B9TGk6",
            "carrier": "MI",
            "origin": "SIN",
            "destination": "CCU",
            "basisCode": "WEII3M"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A3bo54TZtAVWPI39URPp66Hy1bH8Sfv0uHGLK6B9TGk6",
            "segmentId": "GLkJy6cZO+f-GQ3b"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A8c9zPzNI1emHRxGQo7joRoJT7Ni7wOhSxNiXZ5/6vYo",
            "segmentId": "GNehALVLSmXwJvB7"
           }
          ],
          "baseFareTotal": "INR19000",
          "saleFareTotal": "INR19000",
          "saleTaxTotal": "INR19926",
          "saleTotal": "INR38926",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR1064"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR14714"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR824"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR30"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR30"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "OO_001",
            "chargeType": "GOVERNMENT",
            "code": "OO",
            "country": "SG",
            "salePrice": "INR383"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "SG_001",
            "chargeType": "GOVERNMENT",
            "code": "SG",
            "country": "SG",
            "salePrice": "INR953"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "OP_001",
            "chargeType": "GOVERNMENT",
            "code": "OP",
            "country": "SG",
            "salePrice": "INR292"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           }
          ],
          "fareCalculation": "BLR MI X/SIN 172.99WEII3M MI CCU 112.82WEII3M NUC 285.81 END ROE 66.4751 FARE INR 19000 XT 68F2 68G1 1410IN 1888JN 150WO 383OO 292OP 953SG 14714YQ",
          "latestTicketingTime": "2018-03-31T23:59-05:00",
          "ptc": "ADT"
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR38926",
        "id": "KTzbbxXHx8CTqZsaHq32xD00E",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 775,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 275,
            "flight": {
             "carrier": "MI",
             "number": "423"
            },
            "id": "GnAxbDs2D-ntNS0q",
            "cabin": "COACH",
            "bookingCode": "W",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LC5iTqfCztKGUAE8",
              "aircraft": "738",
              "arrivalTime": "2018-12-08T16:50+08:00",
              "departureTime": "2018-12-08T09:45+05:30",
              "origin": "BLR",
              "destination": "SIN",
              "destinationTerminal": "2",
              "duration": 275,
              "mileage": 1974,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 245
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 255,
            "flight": {
             "carrier": "MI",
             "number": "5862"
            },
            "id": "GT1O+R3TC9haDDUw",
            "cabin": "COACH",
            "bookingCode": "W",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "Lb9emCwhBuOFBb07",
              "aircraft": "333",
              "arrivalTime": "2018-12-08T22:40+05:30",
              "departureTime": "2018-12-08T20:55+08:00",
              "origin": "SIN",
              "destination": "CCU",
              "originTerminal": "3",
              "duration": 255,
              "operatingDisclosure": "OPERATED BY SINGAPORE AIRLINES",
              "mileage": 1803,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A8c9zPzNI1emHRxGQo7joRoJT7Ni7wOhSxNiXZ5/6vYo",
            "carrier": "MI",
            "origin": "BLR",
            "destination": "SIN",
            "basisCode": "WEII3M"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "A3bo54TZtAVWPI39URPp66Hy1bH8Sfv0uHGLK6B9TGk6",
            "carrier": "MI",
            "origin": "SIN",
            "destination": "CCU",
            "basisCode": "WEII3M"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A3bo54TZtAVWPI39URPp66Hy1bH8Sfv0uHGLK6B9TGk6",
            "segmentId": "GT1O+R3TC9haDDUw"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "A8c9zPzNI1emHRxGQo7joRoJT7Ni7wOhSxNiXZ5/6vYo",
            "segmentId": "GnAxbDs2D-ntNS0q"
           }
          ],
          "baseFareTotal": "INR19000",
          "saleFareTotal": "INR19000",
          "saleTaxTotal": "INR19926",
          "saleTotal": "INR38926",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR1064"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR38"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "YQ_F",
            "chargeType": "CARRIER_SURCHARGE",
            "code": "YQ",
            "salePrice": "INR14714"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR824"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR30"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR30"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "OO_001",
            "chargeType": "GOVERNMENT",
            "code": "OO",
            "country": "SG",
            "salePrice": "INR383"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "SG_001",
            "chargeType": "GOVERNMENT",
            "code": "SG",
            "country": "SG",
            "salePrice": "INR953"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "OP_001",
            "chargeType": "GOVERNMENT",
            "code": "OP",
            "country": "SG",
            "salePrice": "INR292"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           }
          ],
          "fareCalculation": "BLR MI X/SIN 172.99WEII3M MI CCU 112.82WEII3M NUC 285.81 END ROE 66.4751 FARE INR 19000 XT 68F2 68G1 1410IN 1888JN 150WO 383OO 292OP 953SG 14714YQ",
          "latestTicketingTime": "2018-03-31T23:59-05:00",
          "ptc": "ADT"
         }
        ]
       },
       {
        "kind": "qpxexpress#tripOption",
        "saleTotal": "INR65379",
        "id": "KTzbbxXHx8CTqZsaHq32xD00K",
        "slice": [
         {
          "kind": "qpxexpress#sliceInfo",
          "duration": 1455,
          "segment": [
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 235,
            "flight": {
             "carrier": "TG",
             "number": "326"
            },
            "id": "GjNFg-pbVaPb7wHa",
            "cabin": "COACH",
            "bookingCode": "Y",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "0",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LupcvooSIf8cbiy0",
              "aircraft": "330",
              "arrivalTime": "2018-12-08T05:55+07:00",
              "departureTime": "2018-12-08T00:30+05:30",
              "origin": "BLR",
              "destination": "BKK",
              "duration": 235,
              "mileage": 1547,
              "meal": "Meal"
             }
            ],
            "connectionDuration": 1070
           },
           {
            "kind": "qpxexpress#segmentInfo",
            "duration": 150,
            "flight": {
             "carrier": "TG",
             "number": "313"
            },
            "id": "GpRtXzrGs1+Fei-q",
            "cabin": "COACH",
            "bookingCode": "Y",
            "bookingCodeCount": 4,
            "marriedSegmentGroup": "1",
            "leg": [
             {
              "kind": "qpxexpress#legInfo",
              "id": "LVZY0KQPuF3LAJAc",
              "aircraft": "330",
              "arrivalTime": "2018-12-09T00:45+05:30",
              "departureTime": "2018-12-08T23:45+07:00",
              "origin": "BKK",
              "destination": "CCU",
              "duration": 150,
              "mileage": 1016,
              "meal": "Meal"
             }
            ]
           }
          ]
         }
        ],
        "pricing": [
         {
          "kind": "qpxexpress#pricingInfo",
          "fare": [
           {
            "kind": "qpxexpress#fareInfo",
            "id": "ALKgxdohPWvAUbYac8USpGo7dxnG9reD9jZnOL7t7s+M",
            "carrier": "TG",
            "origin": "BLR",
            "destination": "BKK",
            "basisCode": "YRMTG"
           },
           {
            "kind": "qpxexpress#fareInfo",
            "id": "AiO0jcEuiMSZ5QIjertAoMe4InR6TlqYRsh2hTRgM7G6",
            "carrier": "TG",
            "origin": "BKK",
            "destination": "CCU",
            "basisCode": "YRMTG"
           }
          ],
          "segmentPricing": [
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "ALKgxdohPWvAUbYac8USpGo7dxnG9reD9jZnOL7t7s+M",
            "segmentId": "GjNFg-pbVaPb7wHa"
           },
           {
            "kind": "qpxexpress#segmentPricing",
            "fareId": "AiO0jcEuiMSZ5QIjertAoMe4InR6TlqYRsh2hTRgM7G6",
            "segmentId": "GpRtXzrGs1+Fei-q"
           }
          ],
          "baseFareTotal": "INR58760",
          "saleFareTotal": "INR58760",
          "saleTaxTotal": "INR6619",
          "saleTotal": "INR65379",
          "passengers": {
           "kind": "qpxexpress#passengerCounts",
           "adultCount": 1
          },
          "tax": [
           {
            "kind": "qpxexpress#taxInfo",
            "id": "JN_004",
            "chargeType": "GOVERNMENT",
            "code": "JN",
            "country": "IN",
            "salePrice": "INR3291"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "F2_001",
            "chargeType": "GOVERNMENT",
            "code": "F2",
            "country": "IN",
            "salePrice": "INR118"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G1_001",
            "chargeType": "GOVERNMENT",
            "code": "G1",
            "country": "IN",
            "salePrice": "INR118"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "E7_001",
            "chargeType": "GOVERNMENT",
            "code": "E7",
            "country": "TH",
            "salePrice": "INR134"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G8_001",
            "chargeType": "GOVERNMENT",
            "code": "G8",
            "country": "TH",
            "salePrice": "INR29"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "TS_001",
            "chargeType": "GOVERNMENT",
            "code": "TS",
            "country": "TH",
            "salePrice": "INR1340"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "G8_002",
            "chargeType": "GOVERNMENT",
            "code": "G8",
            "country": "TH",
            "salePrice": "INR29"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "WO_001",
            "chargeType": "GOVERNMENT",
            "code": "WO",
            "country": "IN",
            "salePrice": "INR150"
           },
           {
            "kind": "qpxexpress#taxInfo",
            "id": "IN",
            "chargeType": "GOVERNMENT",
            "code": "IN",
            "country": "IN",
            "salePrice": "INR1410"
           }
          ],
          "fareCalculation": "BLR TG X/BKK M 520.64YRMTG TG CCU M 363.29YRMTG NUC 883.93 END ROE 66.4751 FARE INR 58760 XT 118F2 118G1 1410IN 3291JN 150WO 134E7 58G8 1340TS",
          "latestTicketingTime": "2017-03-31T23:59-05:00",
          "ptc": "ADT",
          "refundable": true
         }
        ]
       }
      ]
     }
   };
  };
