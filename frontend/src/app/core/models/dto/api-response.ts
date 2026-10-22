export interface ApiResponse<T>{
    success : boolean;
    message : String;
    data : T | null;
    timestamp : String;
}
