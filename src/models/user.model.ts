export default interface User {
    id?: number;
    email: string;
    first_name: string;
    last_name: string;
    profile_image: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}