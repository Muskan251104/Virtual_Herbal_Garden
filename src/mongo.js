const mongoose=require("mongoose")


mongoose.connect("mongodb://localhost:27017/LoginFormPractice")

.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
})
const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  botanicalName: { type: String, required: true },
  commonNames: { type: [String], required: true },
  category: { type: [String], required: true },
  habitat: {
    nativeRegion: { type: String, required: true },
    growingConditions: {
      soil: { type: String, required: true },
      sunlight: { type: String, required: true },
      water: { type: String, required: true }
    }
  },
  medicinalUses: [
    {
      use: { type: String, required: true },
      description: { type: String, required: true }
    }
  ],
  methodsOfCultivation: {
    propagation: { type: String, required: true },
    planting: {
      instructions: { type: String, required: true },
      spacing: { type: String, required: true }
    },
    watering: { type: String, required: true },
    fertilization: { type: String, required: true },
    pruning: { type: String, required: true },
    pestsAndDiseases: { type: String, required: true }
  },
  imageUrl: { type: String, required: true },
  modelUrl: { type: String, required: true }
});

const Plant = mongoose.model('Plant', plantSchema);
const logInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        unique:true,
        
    },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' ,unique:true}],
    notes: [
      {
        text: {
          type: String,
          required: true,
        }
        // You can also add other fields like timestamps or IDs if needed
        
      }
    ],
})
const LogInCollection=new mongoose.model('LogInCollection',logInSchema)




  
  

  module.exports = {
    LogInCollection,
    Plant
  };


