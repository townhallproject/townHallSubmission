import request from 'superagent';

import { firebasedb } from '../../scripts/util/setupFirebase';

export const resetTownHall = () => ({
  type: 'RESET_TOWNHALL',
});

export const setDistrict = payload => ({
  payload,
  type: 'SET_DISTRICT',
});

export const setUsState = payload => ({
  payload,
  type: 'SET_US_STATE',
});

export const setDataFromPersonInDatabase = payload => ({
  payload,
  type: 'SET_DATA_FROM_PERSON',
});

export const setAdditionalMember = payload => ({
  payload,
  type: 'SET_ADDITIONAL_MEMBER',
});

export const setMeetingType = payload => ({
  payload,
  type: 'SET_MEETING_TYPE',
});

export const setStartTime = payload => ({
  payload,
  type: 'SET_START_TIME',
});

export const setEndTime = payload => ({
  payload,
  type: 'SET_END_TIME',
});

export const setDate = payload => ({
  payload,
  type: 'SET_DATE',
});

export const setLatLng = payload => ({
  payload,
  type: 'SET_LAT_LNG',
});

export const setDateWithTimeZone = payload => ({
  payload,
  type: 'SET_TIME_ZONE',
});

export const addDisclaimer = () => ({
  type: 'ADD_DISCLAIMER',
});

export const clearDisclaimer = () => ({
  type: 'CLEAR_DISCLAIMER',
});

export const mergeNotes = () => ({
  type: 'MERGE_NOTES',
});

export const setValue = payload => ({
  payload,
  type: 'SET_VALUE',
});

export const getLatLng = payload => dispatch => request
  .get('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB868a1cMyPOQyzKoUrzbw894xeoUhx9MM')
  .set('Accept', 'application/json')
  .query({
    address: payload,
  })
  .then((r) => {
    console.log(r.body.results[0]);
    const {
      results,
    } = r.body;
    if (results) {
      const res = {
        address: results[0].formatted_address.split(', USA')[0],
        lat: results[0].geometry.location.lat,
        lng: results[0].geometry.location.lng,
      };
      console.log(res);
      return (dispatch(setLatLng(res)));
    }
    return Promise.reject('error geocoding', res);
  });

export const getTimeZone = payload => (dispatch) => {
  const time = Date.parse(`${payload.date} ${payload.time}`) / 1000;
  const loc = `${payload.lat},${payload.lng}`;
  console.log(time, loc);
  const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${loc}&timestamp=${time}&key=AIzaSyB868a1cMyPOQyzKoUrzbw894xeoUhx9MM`;
  return request
    .get(url)
    .then((r) => {
      const response = r.body;
      if (!response.timeZoneName) {
        return Error('no timezone results', response);
      }
      const zoneString = response.timeZoneId;
      const timezoneAb = response.timeZoneName.split(' ');
      const timeZone = timezoneAb.reduce((acc, cur) => {
        acc += cur[0];
        return acc;
      }, '');
      const offset = response.rawOffset / 60 / 60 + response.dstOffset / 60 / 60;
      let utcoffset;
      if (parseInt(offset) === offset) {
        utcoffset = `UTC${offset}00`;
      } else {
        const fract = offset * 10 % 10 / 10;
        const integr = Math.trunc(offset);
        let mins = (Math.abs(fract * 60)).toString();
        const zeros = '00';
        mins = zeros.slice(mins.length) + mins;
        utcoffset = `UTC${integr}${mins}`;
      }

      const dateObj = new Date(`${payload.date.replace(/-/g, '/')} ${payload.time} ${utcoffset}`).getTime();

      return (dispatch(setDateWithTimeZone(
        {
          dateObj,
          timeZone,
          zoneString,
        },
      )));
    }).catch((error) => {
      console.log(error);
    });
};

const updateMOCData = (payload) => {
  if (!payload.memberId) {
    return Promise.resolve();
  }
  const updates = {
    lastUpdated: Date.now(),
    lastUpdatedBy: payload.userDisplayName,
  };
  return firebasedb.ref(`${payload.mocDataPath}/${payload.memberId}`).update(updates);
};

const updateUserEvents = (payload) => {
  const path = `users/${payload.uid}`;
  const updates = {};
  const currentEvent = {};
  const mocData = {
    lastUpdated: Date.now(),
    govtrack_id: payload.govtrack_id || null,
    thp_id: payload.thp_id || null,
  };
  let id = payload.govtrack_id ? payload.govtrack_id : payload.thp_id;
  id = id || 'candidate';
  updates[`${path}/currentEvents/${payload.eventId}`] = currentEvent;
  updates[`${path}/mocs/${id}`] = mocData;
  return firebasedb.ref().update(updates);
};

export const saveMetaData = payload => (dispatch) => {
  Promise.all([updateMOCData(payload), updateUserEvents()])
    .then(() => dispatch(resetTownHall()))
    .catch((error) => {
      console.log('error updating user or moc', error);
    });
};

export const submitEventForReview = payload => dispatch => firebasedb.ref(`${payload.saveUrl}/${payload.currentTownHall.eventId}`).update(payload.currentTownHall)
    .then(() => dispatch(saveMetaData(payload.metaData)));