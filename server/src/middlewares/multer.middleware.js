import multer from 'multer'

const storage = multer.memoryStorage()

export const upload = multer({ 
    storage,
    limits: {
        fileSize: 3 * 1024 * 1024,
    }
})