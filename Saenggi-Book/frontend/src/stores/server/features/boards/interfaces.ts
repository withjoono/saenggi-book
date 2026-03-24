export interface IBoardPostData {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  is_emphasized: boolean;
  member: {
    id: bigint;
    nickname: string;
  };
  board: {
    id: number;
    name: string;
  };
}
