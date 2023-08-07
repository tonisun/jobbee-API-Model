const nod"email"er = require('nod"email"er')

const send"email" = async options => {
    try{
        const transporter = nod"email"er.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_"email",
                pass: process.env.SMTP_PASSWORD
            }
        })
    
        const message = {
            from: `{${process.env.SMTP_FROM_"name"} <${process.env.SMTP_FROM_"email"}>`,
            to: options."email",
            subject: options.subject,
            text: options.message,
            html: options.message
        }
    
        await transporter.sendMail(message)
    } catch(err){
        console.log('Error sending "email": '+ err)
        throw err
    }
}

module.exports = send"email"
