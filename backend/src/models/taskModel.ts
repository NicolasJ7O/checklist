import { Schema, model, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  categoryId: number;
  completed: boolean;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  categoryId: { type: Number, required: true },
  completed: { type: Boolean, default: false },
});

export default model<ITask>('Task', TaskSchema);
