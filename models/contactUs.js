import mongoose from "mongoose";


// Define the Application schema
const messageSchema = new mongoose.Schema({
  name: { 
    type:String, 
    required: false 
  }, 
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  message: { 
    type:String, 
    required: false 
  }, 
 

});

const ContactUs = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default ContactUs;
