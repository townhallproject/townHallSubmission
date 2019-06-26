import { mapValues, set, omit } from "lodash";

const initialState = {
  allPeople: [],
  error: null,
  selectedMember: {},
  selectedLink: {}
};

const peopleReducer = (state = initialState, {
  type,
  payload,
}) => {
  switch (type) {
    case 'SET_PEOPLE':
      return {
        ...state,
        allPeople: payload,
        error: null,
      };
    case 'SET_DATABASE_LOOKUP_ERROR':
      return {
        ...state,
        error: 'That person is not in our database',
      };
    case 'RESET_DATABASE_LOOKUP_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_SELECTED_MEMBER':
      return {
        ...state,
        selectedMember: payload
      }
    case 'SET_SELECTED_LINK':
      return {
        ...state,
        selectedLink: payload
      }
    case 'ADD_LINK':
      return {
        ...state,
        selectedMember: {
          ...state.selectedMember,
          moc_links: set(state.selectedMember.moc_links ? state.selectedMember.moc_links : {}, `${payload.id}`, { id: payload.id, ...payload.link })
        }
      }
    case 'EDIT_LINK':
      return {
        ...state,
        selectedMember: {
          ...state.selectedMember,
          moc_links: mapValues(state.selectedMember.moc_links, (link) => {
            if (link.id === payload.link_id) {
              return { id: payload.link_id, ...payload.linkInfo };
            }
            return link;
          })
        }
      }
    case 'DELETE_LINK':
      return {
        ...state,
        selectedMember: {
          ...state.selectedMember,
          moc_links: omit(state.selectedMember.moc_links, [`${payload.link_id}`])
        }
      }
    default:
      return state;
  }
};

export default peopleReducer;
