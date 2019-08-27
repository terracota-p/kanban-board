import initialData from './initial-data.json';
import { Column, Cards } from './types';
import { DraggableLocation, DraggableId } from 'react-beautiful-dnd';
import { ThunkDispatch } from 'redux-thunk';

export const fetchCards = () => async (dispatch: ThunkDispatch<{}, {}, any>): Promise<FetchCardsSuccessAction | FetchCardsFailureAction> => {
  dispatch(fetchCardsBegin());
  try {
    const json: Cards = await fakeGetCards();
    return dispatch(fetchCardsSuccess(json));
  }
  catch (error) {
    return dispatch(fetchCardsFailure(error));
  }
};

export function moveWithinSameColumn(startCol: Column, source: DraggableLocation, destination: DraggableLocation, draggableId: DraggableId): MoveWithinColumnAction {
  return {
    type: MOVE_WITHIN_COLUMN,
    startCol: startCol,
    source: source,
    destination: destination,
    draggableId: draggableId
  };
}

export function moveBetweenColumns(startCol: Column, endCol: Column, source: DraggableLocation, destination: DraggableLocation, draggableId: DraggableId) {
  return {
    type: MOVE_BETWEEN_COLUMNS,
    startCol: startCol,
    endCol: endCol,
    source: source,
    destination: destination,
    draggableId: draggableId
  };
}

function fakeGetCards(): Promise<Cards> {
  return new Promise(resolve => {
    // Resolve after a timeout so we can see the loading indicator
    setTimeout(
      () =>
        resolve(initialData),
      1000
    );
  });
}

interface FetchCardsBeginAction {
  type: typeof FETCH_CARDS_BEGIN
}

interface FetchCardsSuccessAction {
  type: typeof FETCH_CARDS_SUCCESS
  payload: Cards
}

interface FetchCardsFailureAction {
  type: typeof FETCH_CARDS_FAILURE
  error: Error | null
}

interface MoveWithinColumnAction {
  type: typeof MOVE_WITHIN_COLUMN;
  startCol: Column;
  source: DraggableLocation;
  destination: DraggableLocation;
  draggableId: DraggableId;
}

interface MoveBetweenColumnsAction {
  type: typeof MOVE_BETWEEN_COLUMNS;
  startCol: Column;
  endCol: Column;
  source: DraggableLocation;
  destination: DraggableLocation;
  draggableId: DraggableId;
}

export const FETCH_CARDS_BEGIN = 'FETCH_CARDS_BEGIN';
export const FETCH_CARDS_SUCCESS = 'FETCH_CARDS_SUCCESS';
export const FETCH_CARDS_FAILURE = 'FETCH_CARDS_FAILURE';
export const MOVE_WITHIN_COLUMN = 'MOVE_WITHIN_COLUMN';
export const MOVE_BETWEEN_COLUMNS = 'MOVE_BETWEEN_COLUMNS';

export const fetchCardsBegin = (): FetchCardsBeginAction => ({
  type: FETCH_CARDS_BEGIN
});

export const fetchCardsSuccess = (cards: Cards): FetchCardsSuccessAction => ({
  type: FETCH_CARDS_SUCCESS,
  payload: cards
});

export const fetchCardsFailure = (error: Error): FetchCardsFailureAction => ({
  type: FETCH_CARDS_FAILURE,
  error: error
});

export type CardsActionsTypes = FetchCardsBeginAction | FetchCardsSuccessAction | FetchCardsFailureAction | MoveWithinColumnAction | MoveBetweenColumnsAction;