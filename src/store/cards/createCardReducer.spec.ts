import { cardsReducer, initialState } from "./reducers";
import {
  CreateCardBeginAction,
  CREATE_CARD_BEGIN,
  CREATE_CARD_SUCCESS,
  CREATE_CARD_FAILURE
} from "./createCardActions";
import {
  KanbanBoardState,
  Card,
  CardLoading,
  CardLoaded,
  CardErrorLoading
} from "./types";

describe("create card reducer", () => {
  it("should return the initial state", () => {
    expect(cardsReducer(undefined, {} as any)).toEqual(initialState);
  });

  it("should add card in loading status on CREATE_CARD_BEGIN from initial state", () => {
    const card: Card = { id: "card-1234", content: "An easy card" };
    const action: CreateCardBeginAction = {
      type: CREATE_CARD_BEGIN,
      payload: card
    };
    const resultState = cardsReducer(initialState, action);

    const newCardLoading: CardLoading = { ...card, loading: true };
    expect(resultState).toEqual(
      stateAfterOneCreate(initialState, newCardLoading)
    );
  });

  it("should add card in loading status on CREATE_CARD_BEGIN from state with card added previously", () => {
    const previousCard: Card = { id: "card-1234", content: "An easy card" };
    const previousState: KanbanBoardState = stateAfterOneCreate(
      initialState,
      previousCard
    );
    const firstColId = Object.keys(previousState.columns)[0];
    console.log(
      "previousState.columns[firstColId].cardIds: ",
      previousState.columns[firstColId].cardIds
    );

    const card: Card = { id: "card-1235", content: "A difficult card" };
    const action: CreateCardBeginAction = {
      type: CREATE_CARD_BEGIN,
      payload: card
    };
    const resultState = cardsReducer(previousState, action);

    const newCardLoading: CardLoading = { ...card, loading: true };
    console.log(
      "previousState.columns[firstColId].cardIds: ",
      previousState.columns[firstColId].cardIds
    );
    const stateAfterTwoCreates: KanbanBoardState = {
      ...previousState,
      cards: { ...previousState.cards, [card.id]: newCardLoading },
      columns: {
        ...previousState.columns,
        [firstColId]: {
          ...previousState.columns[firstColId],
          cardIds: [...previousState.columns[firstColId].cardIds, card.id]
        }
      }
    };
    console.log(
      "resultState.columns[firstColId].cardIds: ",
      resultState.columns[firstColId].cardIds
    );
    expect(resultState).toEqual(stateAfterTwoCreates);
  });

  it("should disable loading and store _id of card on CREATE_CARD_SUCCESS", () => {
    const previousCard: CardLoading = {
      id: "card-1234",
      content: "An easy card",
      loading: true
    };
    const cardLoadingState: KanbanBoardState = {
      ...initialState,
      cards: { ...initialState.cards, [previousCard.id]: previousCard }
    };

    const cardLoaded: CardLoaded = {
      ...previousCard,
      loading: false,
      _id: "id-autogenerated-in-backend"
    };
    const resultState = cardsReducer(cardLoadingState, {
      type: CREATE_CARD_SUCCESS,
      payload: cardLoaded
    });

    const stateAfterSuccess: KanbanBoardState = {
      ...cardLoadingState,
      cards: { ...cardLoadingState.cards, [previousCard.id]: cardLoaded }
    };
    expect(resultState).toEqual(stateAfterSuccess);
  });

  it("should set card with error on CREATE_CARD_FAILURE", () => {
    const previousCard: CardLoading = {
      id: "card-1234",
      content: "An easy card",
      loading: true
    };
    const cardLoadingState: KanbanBoardState = {
      ...initialState,
      cards: { ...initialState.cards, [previousCard.id]: previousCard }
    };

    const error = new Error("an error");
    const resultState = cardsReducer(cardLoadingState, {
      type: CREATE_CARD_FAILURE,
      payload: previousCard,
      error: error
    });

    const cardWithError: CardErrorLoading = {
      ...previousCard,
      loading: false,
      error: true
    };
    const stateAfterErrorLoadingCard: KanbanBoardState = {
      ...cardLoadingState,
      cards: { ...cardLoadingState.cards, [previousCard.id]: cardWithError },
      error: error
    };
    expect(resultState).toEqual(stateAfterErrorLoadingCard);
  });
});

export function stateAfterOneCreate(
  state: KanbanBoardState,
  card: Card
): KanbanBoardState {
  const firstCol = state.columns[Object.keys(state.columns)[0]];
  return {
    ...state,
    cards: { ...state.cards, [card.id]: card },
    columns: {
      ...state.columns,
      [firstCol.id]: {
        ...state.columns[firstCol.id],
        // Card added to cards and columns[0].cardIds (was empty before)
        cardIds: [card.id]
      }
    }
  };
}
