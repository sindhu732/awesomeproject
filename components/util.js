import dateFormat from 'dateformat';

import timeList from '../data/time-list.json';
import englishTimeList from '../data/english-time-list.json';

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

export default class Util {
  static timeLabels = {
    absent: '0',
    continuing: '1',
    arriveFirst: '5',
    arriveSecond: '10',
    arriveThird: '15',
    departFirst: '-5',
    departSecond: '-10',
    departThird: '-15'
  };

  static certaintyLabels = {
    null: 0,
    certain: 1,
    uncertain: 2,
    nestCertain: 3,
    nestUncertain: 4
  };

  static certaintyLabelsUser = {
    null: '',
    certain: '✓',
    uncertain: '•',
    nestCertain: 'N✓',
    nestUncertain: 'N•'
  };

  static certaintyLabelsDb2UserMap = {
    '0': '',
    '1': '✓',
    '2': '•',
    '3': 'N✓',
    '4': 'N•'
  }

  static estrusLabels = {
    a: 0,
    b: 25,
    c: 50,
    d: 75,
    e: 100
  };

  static estrusLabelsUser = {
    a: '.00',
    b: '.25',
    c: '.50',
    d: '.75',
    e: '1.0'
  };

  static estrusLabelsDb2UserMap = {
    '0': '.00',
    '25': '.25',
    '50': '.50',
    '75': '.75',
    '100': '1.0'
  }

  static generateuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  static getCertaintyOutput(certaintyLabel) {
    return certaintyLabel == this.certaintyLabels.certain ||
      certaintyLabel == this.certaintyLabels.nestCertain ? 1 : 0;
  }

  static getCommunityIdOutput(communityId) {
    switch (communityId) {
      case 'kasekela':
        return 'KK';
      case 'mitumba':
        return 'MT';
      default:
        return '';
    }
  }

  static getCycleOutput(estrusLabel) {
    return (estrusLabel / 100).toFixed(2);
  }

  static getCertaintyLabelWithoutNesting(certaintyLabel) {
    switch (certaintyLabel) {
      case this.certaintyLabels.nestCertain:
        return this.certaintyLabels.certain;
      case this.certaintyLabels.nestUncertain:
        return this.certaintyLabels.uncertain;
      default:
        return certaintyLabel;
    }
  }

  static isInNest(certaintyLabel) {
    return (certaintyLabel == this.certaintyLabels.nestCertain) || (certaintyLabel == this.certaintyLabels.nestUncertain);
  }

  static getNestingOutput(arriveCertaintyLabel, departCertaintyLabel) {
    const isArriveInNest = this.isInNest(arriveCertaintyLabel);
    const isDepartInNest = this.isInNest(departCertaintyLabel);

    /*
     * 0: the row did NOT start in a nest and did NOT end in a nest
     * 1: the row STARTED in a nest, but did NOT end in a nest
     * 2: the row did NOT start in a nest, but ENDED in a nest
     * 3: the row STARTED and ENDED in a nest.
    */

    return isDepartInNest * 2 + isArriveInNest;
  }

  static getTimeOutput(dbTime) {
    if (dbTime == "ongoing") {
      return dbTime;
    }
    const timeIndex = this.getDbTimeIndex(dbTime);
    // TODO: -1 since english-time was ahead by 1hr
    const englishTime = englishTimeList[timeIndex];
    return englishTime.substring(0, englishTime.indexOf(':') + 1)+ dbTime.substring(dbTime.indexOf(':') + 1, dbTime.indexOf(':') + 3);
  }

  static getTimeOutputUsingSuffix(dbTime) {
    if (dbTime == "ongoing") {
      return dbTime;
    }
    const columnIndex = dbTime.indexOf(':');
    const minuteString = dbTime.substring(columnIndex, columnIndex+3);
    const hourInt = parseInt(dbTime.substring(0, columnIndex+1));

    let englishTime = hourInt + 6;

    if (dbTime.slice(-1) == "A") {
      if (hourInt == 12) {
        englishTime = hourInt-12;
      }
      return englishTime.toString() + minuteString;
    } else if (dbTime.slice(-1) == "J") {
      if (hourInt < 5) {
        englishTime = hourInt + 12;
      }
      return englishTime.toString() + minuteString;
    }
  }

  static dbTime2UserTime = (dbTime) => {
    // We expect something like 01-12:00J, so find the first - and take
    // everything after that.
    const dashIndex = dbTime.indexOf('-');
    return dbTime.substring(dashIndex + 1);
  }

  static getTrackerTimes = (time) => {
    const columnIndex = time.indexOf(':');
    const startMinute = parseInt(time.substring(columnIndex + 1, columnIndex + 3));
    let minutes = [];
    for (let i = 0; i < 15; ++i) { minutes.push(startMinute + i); }
    const hourString = time.substring(0, columnIndex + 1);
    const lastCharacter = time.slice(-1);
    return minutes.map((m, i) => { return hourString + m.pad(2) + lastCharacter });
  }

  static getDateString = (date) => {
    return dateFormat(date, "dd-mm-yyyy");
  }

  static compareChimp = (c1, c2) => {
    if (c1.name < c2.name) {
      return -1;
    }
    if (c1.name > c2.name) {
      return 1;
    }

    return 0;
  }

  static compareUserTime = (t1, t2) => {
    // t1 == t2 => 0
    // t1 > t2 => 1
    // t1 < t2 => -1
    if (t1 === t2) { return 0; }
    const lastChar1 = t1.charAt(t1.length - 1);
    const lastChar2 = t2.charAt(t2.length - 1);
    if (lastChar1 !== lastChar2) {
      return lastChar1 === 'J' ? 1 : -1;
    }

    return t1.localeCompare(t2);
  }

  static getDbTimeIndex(dbTime) {
    return parseInt(dbTime.substring(0, 2));
  }

  static getPreviousDbTime(dbTime) {
    const dbTimeIndex = this.getDbTimeIndex(dbTime);
    return timeList[dbTimeIndex - 1];
  }

  static getIntervalLastMinuteDbTime(dbTime) {
    const prefix = dbTime.substring(0, dbTime.length - 3);
    let minutes = parseInt(dbTime.substring(dbTime.length - 3, dbTime.length - 1));
    const suffix = dbTime.substring(dbTime.length - 1);
    minutes += 14;
    return prefix + this.formatNumberLength(minutes, 2) + suffix;
  }

  static getDbTimeOffset(dbTime) {
    let minutes = parseInt(dbTime.substring(dbTime.length - 3, dbTime.length - 1));
    return minutes % 15;
  }

  static getTimeDifference(dbTimeLatter, dbTimeFormer) {
    const baseDifference = this.getDbTimeIndex(dbTimeLatter) - this.getDbTimeIndex(dbTimeFormer);
    return baseDifference * 15 + this.getDbTimeOffset(dbTimeLatter) - this.getDbTimeOffset(dbTimeFormer);
  }

  static getFollowArrivalTime(dbTime, part) {
    const prefix = dbTime.substring(0, dbTime.length - 3);
    let minutes = parseInt(dbTime.substring(dbTime.length - 3, dbTime.length - 1));
    const suffix = dbTime.substring(dbTime.length - 1);
    let offset = 0;
    switch(part) {
      case 'First':
        offset = 4;
        break;
      case 'Second':
        offset = 9;
        break;
      case 'Third':
        offset = 14;
        break;
    }
    minutes += offset;
    return prefix + this.formatNumberLength(minutes, 2) + suffix;
  }

  static formatNumberLength(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
  }

  static hasGrooming(grooming) {
    return grooming !== 'N';
  }
}
