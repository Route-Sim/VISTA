import {
  type EdgeId,
  type Identifiable,
  type NodeId,
} from '@/sim/domain/types';

export class Edge implements Identifiable {
  private readonly _id: EdgeId;
  private readonly _startNodeId: NodeId;
  private readonly _endNodeId: NodeId;

  constructor(params: { id: EdgeId; startNodeId: NodeId; endNodeId: NodeId }) {
    this._id = params.id;
    this._startNodeId = params.startNodeId;
    this._endNodeId = params.endNodeId;
  }

  public get id(): EdgeId {
    return this._id;
  }

  public get startNodeId(): NodeId {
    return this._startNodeId;
  }

  public get endNodeId(): NodeId {
    return this._endNodeId;
  }
}
