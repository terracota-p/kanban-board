import configureMockStore, { MockStore } from "redux-mock-store";
import thunk from "redux-thunk";
import * as actions from "./createCardActions";
import expect from "expect";
import { Card, Column } from "./types";
import { backendUrl } from "../../util/backendUrl";
import {
  moveCardWithinColumn,
  MOVE_CARD_WITHIN_COLUMN_BEGIN,
  MOVE_CARD_WITHIN_COLUMN_FAILURE
} from "./dragCardActions";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("drag card actions", () => {
  var store: MockStore;
  beforeEach(() => {
    fetchMock.resetMocks();
    store = mockStore();
  });

  it("given column with cards, when drag card within column, then BEGIN and PUT column", () => {
    fetchMock.once("{}");
    const cardId1 = "card-1";
    const columnBackendId = "be-col-1";
    const cardId2 = "card-2";
    const column: Column = columnWithCards(columnBackendId, cardId1, cardId2);

    return moveCardWithinColumn(column, 0, 1, cardId1, store.dispatch).then(
      expectations()
    );

    function expectations(): any {
      return () => {
        // Nothing to do in UI on SUCCESS, then no SUCCESS action dispatched
        const expectedColumnWithSwappedCardIds = {
          ...column,
          cardIds: [cardId2, cardId1]
        };
        const expectedActions = [
          {
            type: MOVE_CARD_WITHIN_COLUMN_BEGIN,
            updatedColumn: expectedColumnWithSwappedCardIds
          }
        ];
        expect(store.getActions()).toEqual(expectedActions);

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0].url).toEqual(
          backendUrl() + "/columns/" + columnBackendId
        );
        expect(fetchMock.mock.calls[0][0].method).toEqual("PUT");
      };
    }
  });

  it("given there will be network error on PUT, when move card within column, then BEGIN, PUT and FAILURE", () => {
    const error = new TypeError("Failed to fetch (simulated network error)");
    fetchMock.mockReject(error);
    const cardId1 = "card-1";
    const columnBackendId = "be-col-1";
    const cardId2 = "card-2";
    const column: Column = columnWithCards(columnBackendId, cardId1, cardId2);

    return moveCardWithinColumn(column, 0, 1, cardId1, store.dispatch).then(
      expectations()
    );

    function expectations(): any {
      return () => {
        const expectedColumnWithSwappedCardIds = {
          ...column,
          cardIds: [cardId2, cardId1]
        };
        const expectedActions = [
          {
            type: MOVE_CARD_WITHIN_COLUMN_BEGIN,
            updatedColumn: expectedColumnWithSwappedCardIds
          },
          { type: MOVE_CARD_WITHIN_COLUMN_FAILURE, error: error }
        ];
        expect(store.getActions()).toEqual(expectedActions);

        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0].url).toEqual(
          backendUrl() + "/columns/" + columnBackendId
        );
        expect(fetchMock.mock.calls[0][0].method).toEqual("PUT");
      };
    }
  });
});

function columnWithCards(
  columnBackendId: string,
  ...cardIds: string[]
): Column {
  return {
    _id: columnBackendId,
    id: "col-1",
    title: "to do",
    cardIds: cardIds
  };
}