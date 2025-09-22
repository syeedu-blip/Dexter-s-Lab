/**
 * Advanced AI Krishi Mitra - Complete System
 * Features: Natural Language Processing, Multimodal Inputs, Voice Support,
 * Context-Aware AI, Escalation System, Learning Loop
 */

const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();

// Ensure required directories exist
const dirs = ["uploads/", "audio/", "data/"];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/', 'audio/'];
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'), false);
    }
  }
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// In-memory data stores (replace with database in production)
let farmers = new Map(); // farmer profiles and history
let escalations = [];
let queries = []; // for learning loop
let knowledgeBase = new Map(); // cached knowledge
let feedback = []; // user feedback for learning

/* ---------------------- KNOWLEDGE BASE ---------------------- */
const cropDatabase = {
  "banana": {
    commonDiseases: ["leaf spot", "panama disease", "black sigatoka"],
    pests: ["aphids", "nematodes", "thrips"],
    seasons: { plant: "June-July", harvest: "April-May" },
    pesticides: {
      "leaf spot": "Copper oxychloride 0.3% or Mancozeb 0.2%",
      "black sigatoka": "Propiconazole 0.1%"
    }
  },
  "rice": {
    commonDiseases: ["blast", "brown spot", "sheath blight"],
    pests: ["stem borer", "brown planthopper", "leaf folder"],
    seasons: { plant: "May-June, Nov-Dec", harvest: "Sep-Oct, Mar-Apr" },
    pesticides: {
      "blast": "Tricyclazole 0.06% or Carbendazim 0.1%",
      "brown spot": "Mancozeb 0.2%"
    }
  },
  "tomato": {
    commonDiseases: ["late blight", "early blight", "bacterial wilt"],
    pests: ["whitefly", "fruit borer", "aphids"],
    seasons: { plant: "Oct-Nov, Jan-Feb", harvest: "Dec-Jan, Apr-May" },
    pesticides: {
      "late blight": "Metalaxyl + Mancozeb 0.2%",
      "early blight": "Chlorothalonil 0.2%"
    }
  }
};

const schemes = {
  kerala: [
    { name: "Krishi Bhavan Support", eligibility: "All farmers", benefit: "Free consultation" },
    { name: "Organic Farming Subsidy", eligibility: "Small farmers", benefit: "50% subsidy on organic inputs" },
    { name: "Crop Insurance", eligibility: "All farmers", benefit: "Weather risk coverage" }
  ]
};

/* ---------------------- AI SERVICES ---------------------- */

// Natural Language Understanding
async function processNaturalLanguage(text, language = 'en') {
  try {
    // Extract key entities from text
    const entities = extractEntities(text.toLowerCase());
    
    // Translate if Malayalam
    if (language === 'ml') {
      text = await translateMalayalam(text);
    }
    
    // Intent classification
    const intent = classifyIntent(text);
    
    return {
      originalText: text,
      translatedText: language === 'ml' ? text : null,
      entities,
      intent,
      confidence: 0.85
    };
  } catch (error) {
    console.error("NLP Error:", error);
    return { error: "Could not process natural language input" };
  }
}

function extractEntities(text) {
  const entities = {
    crop: null,
    disease: null,
    pest: null,
    location: null,
    season: null
  };
  
  // Simple entity extraction (replace with proper NER model)
  const cropWords = ['banana', 'rice', 'tomato', 'coconut', 'pepper', 'cardamom'];
  const diseaseWords = ['spot', 'blight', 'wilt', 'rot', 'disease', 'infection'];
  const pestWords = ['aphid', 'borer', 'thrips', 'nematode', 'pest', 'insect'];
  
  cropWords.forEach(crop => {
    if (text.includes(crop)) entities.crop = crop;
  });
  
  diseaseWords.forEach(disease => {
    if (text.includes(disease)) entities.disease = disease;
  });
  
  pestWords.forEach(pest => {
    if (text.includes(pest)) entities.pest = pest;
  });
  
  return entities;
}

function classifyIntent(text) {
  const intentPatterns = {
    disease_diagnosis: ['disease', 'problem', 'infected', 'spots', 'yellowing'],
    pest_control: ['pest', 'insect', 'eating', 'holes', 'damage'],
    fertilizer_advice: ['fertilizer', 'nutrient', 'growth', 'yield'],
    weather_query: ['weather', 'rain', 'temperature', 'climate'],
    scheme_info: ['scheme', 'subsidy', 'loan', 'government', 'support']
  };
  
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      return intent;
    }
  }
  
  return 'general_query';
}

async function translateMalayalam(text) {
  // Mock translation - replace with actual service
  const commonPhrases = {
    'വാഴയില് പുള്ളി': 'banana leaf spot',
    'രോഗം': 'disease',
    'കീടം': 'pest',
    'മരുന്ന്': 'medicine',
    'എന്ത് ചെയ്യണം': 'what to do'
  };
  
  for (const [malayalam, english] of Object.entries(commonPhrases)) {
    text = text.replace(malayalam, english);
  }
  
  return text;
}

// Image Analysis
async function analyzeImage(imagePath, cropType) {
  try {
    // Mock image analysis - replace with actual ML model
    const fileName = path.basename(imagePath).toLowerCase();
    
    const diseasePatterns = {
      'spot': { disease: 'Leaf Spot', confidence: 0.82 },
      'blight': { disease: 'Late Blight', confidence: 0.89 },
      'yellow': { disease: 'Nutrient Deficiency', confidence: 0.75 },
      'brown': { disease: 'Fungal Infection', confidence: 0.78 }
    };
    
    for (const [pattern, result] of Object.entries(diseasePatterns)) {
      if (fileName.includes(pattern)) {
        return {
          disease: result.disease,
          confidence: result.confidence,
          symptoms: [Visible ${pattern} patterns, 'Affected leaf areas'],
          severity: result.confidence > 0.8 ? 'high' : 'medium'
        };
      }
    }
    
    return {
      disease: 'Unknown condition',
      confidence: 0.45,
      symptoms: ['Unclear symptoms from image'],
      severity: 'low'
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    return { error: "Could not analyze image" };
  }
}

// Voice Processing
async function processVoice(audioPath) {
  try {
    // Mock voice-to-text - replace with actual speech recognition
    return {
      text: "വാഴയിൽ പുള്ളി രോഗം വന്നിട്ടുണ്ട്, എന്ത് മരുന്ന് ഉപയോഗിക്കണം?",
      language: 'ml',
      confidence: 0.87
    };
  } catch (error) {
    console.error("Voice processing error:", error);
    return { error: "Could not process voice input" };
  }
}

// Context-Aware AI Engine
async function generateAdvice(query, context, farmerHistory) {
  try {
    const { nlp, imageAnalysis, crop, location, season } = context;
    
    // Get farmer's context
    const farmerProfile = farmers.get(context.farmerId) || {};
    
    // Build comprehensive context
    const aiContext = {
      location: location || farmerProfile.location,
      crop: crop || nlp?.entities?.crop,
      season: season || getCurrentSeason(),
      previousQueries: farmerHistory?.slice(-5) || [],
      localWeather: await getLocalWeather(location),
      cropCalendar: getCropCalendar(crop, location)
    };
    
    // Generate advice based on intent
    let advice = "";
    let confidence = 0.7;
    
    if (imageAnalysis && imageAnalysis.disease !== 'Unknown condition') {
      advice = await generateDiseaseAdvice(imageAnalysis, aiContext);
      confidence = imageAnalysis.confidence;
    } else if (nlp?.intent) {
      advice = await generateIntentBasedAdvice(nlp, aiContext);
      confidence = nlp.confidence || 0.7;
    } else {
      advice = "I need more information to help you better. Could you describe your problem or upload a photo?";
      confidence = 0.3;
    }
    
    // Add contextual recommendations
    const recommendations = await getContextualRecommendations(aiContext);
    
    return {
      mainAdvice: advice,
      recommendations,
      confidence,
      shouldEscalate: confidence < 0.6,
      context: aiContext
    };
  } catch (error) {
    console.error("AI Engine error:", error);
    return { error: "Could not generate advice" };
  }
}

async function generateDiseaseAdvice(imageAnalysis, context) {
  const { disease, severity } = imageAnalysis;
  const { crop, location } = context;
  
  const cropInfo = cropDatabase[crop];
  if (!cropInfo) {
    return Detected ${disease}. General recommendation: Consult with local agricultural officer for crop-specific treatment.;
  }
  
  const treatment = cropInfo.pesticides[disease.toLowerCase()] || 
                   cropInfo.pesticides[Object.keys(cropInfo.pesticides)[0]];
  
  let advice = `Detected ${disease} in your ${crop}. `;
  
  if (severity === 'high') {
    advice += `This is a serious condition requiring immediate attention. `;
  }
  
  advice += `Recommended treatment: ${treatment}. `;
  advice += `Apply during early morning or late evening. `;
  advice += Ensure proper coverage of affected areas.;
  
  // Add seasonal advice
  if (context.season) {
    advice += ` Since it's ${context.season}, also ensure proper drainage and avoid overhead irrigation.`;
  }
  
  return advice;
}

async function generateIntentBasedAdvice(nlp, context) {
  const { intent, entities } = nlp;
  const { crop, location } = context;
  
  switch (intent) {
    case 'disease_diagnosis':
      return For ${crop} disease issues in ${location}, I recommend uploading a clear photo of the affected plant parts for accurate diagnosis.;
      
    case 'pest_control':
      const cropInfo = cropDatabase[crop];
      if (cropInfo) {
        return Common pests in ${crop}: ${cropInfo.pests.join(', ')}. Use IPM approach - neem oil spray, yellow sticky traps, and biological control agents.;
      }
      return For pest control in ${crop}, use integrated pest management. Upload photos for specific identification.;
      
    case 'fertilizer_advice':
      return For ${crop} in ${context.season || 'current season'}, use balanced NPK fertilizer. Soil testing recommended for precise nutrient management.;
      
    case 'scheme_info':
      const locationSchemes = schemes[location?.toLowerCase()] || [];
      return Available schemes: ${locationSchemes.map(s => s.name).join(', ')}. Contact your local Krishi Bhavan for applications.;
      
    default:
      return I understand you're asking about ${crop}. Please provide more specific details or upload photos for better assistance.;
  }
}

async function getContextualRecommendations(context) {
  const recommendations = [];
  
  // Weather-based recommendations
  if (context.localWeather?.condition === 'rainy') {
    recommendations.push("⛈ Heavy rains expected - ensure proper drainage to prevent fungal diseases");
  }
  
  // Seasonal recommendations
  if (context.season === 'monsoon') {
    recommendations.push("🌧 Monsoon season - increase surveillance for disease outbreaks");
  }
  
  // Crop calendar recommendations
  if (context.cropCalendar?.nextActivity) {
    recommendations.push(📅 Upcoming: ${context.cropCalendar.nextActivity});
  }
  
  return recommendations;
}

// Learning and Feedback System
function recordQuery(query, response, feedback = null) {
  const queryRecord = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    query,
    response,
    feedback,
    farmerId: query.farmerId
  };
  
  queries.push(queryRecord);
  
  // Update farmer profile
  if (!farmers.has(query.farmerId)) {
    farmers.set(query.farmerId, {
      id: query.farmerId,
      location: query.location,
      crops: [],
      queryHistory: [],
      joinDate: new Date().toISOString()
    });
  }
  
  const farmer = farmers.get(query.farmerId);
  farmer.queryHistory.push(queryRecord.id);
  
  if (query.crop && !farmer.crops.includes(query.crop)) {
    farmer.crops.push(query.crop);
  }
  
  farmers.set(query.farmerId, farmer);
}

// Utility functions
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 10 && month <= 2) return 'post-monsoon';
  return 'pre-monsoon';
}

async function getLocalWeather(location) {
  // Mock weather data
  return {
    condition: 'partly cloudy',
    temperature: 28,
    humidity: 75,
    rainfall: 'moderate'
  };
}

function getCropCalendar(crop, location) {
  const cropInfo = cropDatabase[crop];
  if (!cropInfo) return null;
  
  return {
    plantingSeason: cropInfo.seasons.plant,
    harvestSeason: cropInfo.seasons.harvest,
    nextActivity: "Apply fertilizer in 2 weeks"
  };
}

/* ---------------------- API ROUTES ---------------------- */

// Main query processing endpoint
app.post("/api/query", upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      queryText = "", 
      location = "", 
      crop = "", 
      farmerId = "anonymous",
      language = "en",
      season = ""
    } = req.body;

    console.log("Processing query:", { queryText, crop, language, farmerId });

    let processedQuery = queryText;
    let nlpResult = null;
    let imageAnalysis = null;
    let voiceResult = null;

    // Process voice input if provided
    if (req.files?.audio) {
      voiceResult = await processVoice(req.files.audio[0].path);
      if (voiceResult.text) {
        processedQuery = voiceResult.text;
        language = voiceResult.language || language;
      }
    }

    // Process natural language
    if (processedQuery) {
      nlpResult = await processNaturalLanguage(processedQuery, language);
    }

    // Process image if provided
    if (req.files?.image) {
      imageAnalysis = await analyzeImage(req.files.image[0].path, crop);
    }

    // Get farmer history
    const farmerHistory = queries.filter(q => q.query.farmerId === farmerId);

    // Generate AI advice
    const aiResponse = await generateAdvice(
      { queryText: processedQuery, farmerId, crop, location, season },
      { nlp: nlpResult, imageAnalysis, crop, location, season, farmerId },
      farmerHistory
    );

    // Determine if escalation is needed
    let status = "answered";
    if (aiResponse.shouldEscalate || aiResponse.confidence < 0.6) {
      status = "escalated";
      escalations.push({
        id: Date.now(),
        farmerId,
        originalQuery: processedQuery,
        nlpResult,
        imageAnalysis,
        aiResponse,
        location,
        crop,
        priority: aiResponse.confidence < 0.4 ? 'high' : 'medium',
        createdAt: new Date().toISOString()
      });
    }

    // Record query for learning
    recordQuery(
      { queryText: processedQuery, farmerId, crop, location, season },
      aiResponse
    );

    // Clean up uploaded files
    if (req.files?.image) {
      setTimeout(() => fs.unlink(req.files.image[0].path, () => {}), 10000);
    }
    if (req.files?.audio) {
      setTimeout(() => fs.unlink(req.files.audio[0].path, () => {}), 10000);
    }

    const response = {
      answer: aiResponse.mainAdvice,
      recommendations: aiResponse.recommendations || [],
      confidence: aiResponse.confidence,
      status,
      context: {
        detectedCrop: nlpResult?.entities?.crop || crop,
        detectedDisease: imageAnalysis?.disease,
        season: season || getCurrentSeason(),
        language: language
      },
      processingDetails: {
        nlpProcessed: !!nlpResult,
        imageProcessed: !!imageAnalysis,
        voiceProcessed: !!voiceResult
      }
    };

    res.json(response);

  } catch (error) {
    console.error("Query processing error:", error);
    res.status(500).json({ 
      error: "Failed to process your query", 
      details: error.message 
    });
  }
});

// Voice note upload endpoint
app.post("/api/voice", upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const voiceResult = await processVoice(req.file.path);
    
    // Clean up file
    setTimeout(() => fs.unlink(req.file.path, () => {}), 5000);

    res.json({
      text: voiceResult.text,
      language: voiceResult.language,
      confidence: voiceResult.confidence
    });

  } catch (error) {
    console.error("Voice processing error:", error);
    res.status(500).json({ error: "Failed to process voice input" });
  }
});

// Text-to-speech endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    
    // Mock TTS - replace with actual service
    res.json({
      audioUrl: null,
      message: "TTS service will be available soon",
      supportedLanguages: ['en', 'ml', 'hi']
    });

  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "TTS service failed" });
  }
});

// Feedback endpoint for learning loop
app.post("/api/feedback", async (req, res) => {
  try {
    const { queryId, rating, comments, isHelpful } = req.body;
    
    const feedbackEntry = {
      queryId,
      rating,
      comments,
      isHelpful,
      timestamp: new Date().toISOString()
    };
    
    feedback.push(feedbackEntry);
    
    // Update query record
    const queryIndex = queries.findIndex(q => q.id === queryId);
    if (queryIndex !== -1) {
      queries[queryIndex].feedback = feedbackEntry;
    }

    res.json({ message: "Feedback recorded successfully" });

  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Failed to record feedback" });
  }
});

// Escalations management
app.get("/api/escalations", (req, res) => {
  try {
    const recent = escalations.slice(-50).map(esc => ({
      ...esc,
      farmerInfo: farmers.get(esc.farmerId) || {}
    }));
    res.json({ escalations: recent });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch escalations" });
  }
});

// Analytics endpoint
app.get("/api/analytics", (req, res) => {
  try {
    const analytics = {
      totalQueries: queries.length,
      totalFarmers: farmers.size,
      escalationRate: (escalations.length / queries.length * 100).toFixed(1),
      avgConfidence: (queries.reduce((sum, q) => sum + (q.response?.confidence || 0), 0) / queries.length).toFixed(2),
      topCrops: getTopCrops(),
      topDiseases: getTopDiseases(),
      languageDistribution: getLanguageDistribution()
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate analytics" });
  }
});

function getTopCrops() {
  const cropCount = {};
  farmers.forEach(farmer => {
    farmer.crops?.forEach(crop => {
      cropCount[crop] = (cropCount[crop] || 0) + 1;
    });
  });
  return Object.entries(cropCount).sort(([,a], [,b]) => b - a).slice(0, 5);
}

function getTopDiseases() {
  const diseaseCount = {};
  escalations.forEach(esc => {
    if (esc.imageAnalysis?.disease) {
      const disease = esc.imageAnalysis.disease;
      diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
    }
  });
  return Object.entries(diseaseCount).sort(([,a], [,b]) => b - a).slice(0, 5);
}

function getLanguageDistribution() {
  const langCount = { 'en': 0, 'ml': 0, 'hi': 0, 'other': 0 };
  queries.forEach(q => {
    const lang = q.query.language || 'en';
    langCount[lang] = (langCount[lang] || 0) + 1;
  });
  return langCount;
}

/* ---------------------- FRONTEND ---------------------- */

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>🌾 AI Krishi Mitra - Advanced Agricultural Assistant</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 30px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }
    
    .header h1 {
      color: #2c5530;
      margin-bottom: 10px;
      font-size: 2.2em;
    }
    
    .header p {
      color: #666;
      font-size: 1.1em;
    }
    
    .input-section {
      background: #f8f9ff;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 25px;
      border: 1px solid #e0e4e7;
    }
    
    .input-group {
      margin-bottom: 20px;
    }
    
    .input-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }
    
    input, textarea, select {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .file-upload {
      position: relative;
      display: inline-block;
      cursor: pointer;
      width: 100%;
    }
    
    .file-upload input[type="file"] {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    
    .file-upload-label {
      display: block;
      padding: 12px 15px;
      background: #fff;
      border: 2px dashed #ccc;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s;
    }
    
    .file-upload:hover .file-upload-label {
      border-color: #667eea;
      background: #f8f9ff;
    }
    
    .button-group {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 20px;
    }
    
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-primary {
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
    
    .btn-secondary {
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
    }
    
    .btn-secondary:hover {
      background: #e9ecef;
    }
    
    .btn-voice {
      background: #28a745;
      color: white;
    }
    
    .btn-voice:hover {
      background: #218838;
    }
    
    .btn-voice.recording {
      background: #dc3545;
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    
    .response-section {
      background: white;
      border: 1px solid #e0e4e7;
      border-radius: 12px;
      padding: 25px;
      margin-top: 25px;
    }
    
    .response-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-answered {
      background: #d4edda;
      color: #155724;
    }
    
    .status-escalated {
      background: #f8d7da;
      color: #721c24;
    }
    
    .confidence-meter {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .confidence-bar {
      width: 100px;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, #dc3545, #ffc107, #28a745);
      transition: width 0.3s;
    }
    
    .answer {
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      margin-bottom: 20px;
