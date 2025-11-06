export default class AppError extends Error {
    constructor(message = "An error occurred") {
        super(message)
        this.name = "AppError"
    }
}