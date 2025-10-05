# test_model.py
import pickle , re , os
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import Input, Embedding, SpatialDropout1D, Bidirectional, LSTM, Dense, Dropout, Layer
import tensorflow as tf

import tensorflow.keras.backend as K
from tensorflow.keras.models import Model
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

try:
    stopwords.words('english')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')


sentiment_labels = ["positive", "negative", "neutral"]

BASE_DIR = os.path.dirname(__file__)
WEIGHT_PATH = os.path.join(BASE_DIR,  "goemotions_sentiment_singlelabel_bilstm_attention.weights.h5")
TOKEN_PATH = os.path.join(BASE_DIR,  "tokenizer.pkl")
# ---------------------------
# NEW: Text Cleaning Function
# ---------------------------
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

# ลิสต์คำปฏิเสธที่ควรเก็บไว้
negation_words = {
    'not', 'no', 'nor', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't",
    'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
    'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't",
    'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
}

# สร้าง Stopwords ลิสต์สุดท้ายโดยการเอาคำปฏิเสธออกไป
final_stop_words = stop_words - negation_words


def clean_text(text):
    if not isinstance(text, str): text = str(text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text) # Keep only alphanumeric and spaces
    words = word_tokenize(text)
    words = [lemmatizer.lemmatize(w) for w in words if w not in final_stop_words and w.strip()!='']
    return " ".join(words)

# ---------------------------
# Load tokenizer
# ---------------------------
with open(TOKEN_PATH, "rb") as f:
    loaded_tokenizer = pickle.load(f)

# ---------------------------
# Prepare model & load weights
# ---------------------------
NUM_CLASSES = 3  # positive, negative, neutral
MAX_NUM_WORDS = 20000
MAX_SEQ_LEN   = 200
VOCAB_SIZE = min(MAX_NUM_WORDS, len(loaded_tokenizer.word_index) + 1)
EMBEDDING_DIM = 128

class Attention(Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(name="att_weight",
                                 shape=(input_shape[-1], 1),
                                 initializer="glorot_uniform",
                                 trainable=True)
        self.b = self.add_weight(name="att_bias",
                                 shape=(input_shape[1], 1),
                                 initializer="zeros",
                                 trainable=True)
        super().build(input_shape)

    def call(self, x):
        e = K.tanh(K.dot(x, self.W) + self.b)
        a = K.softmax(e, axis=1)
        return K.sum(x * a, axis=1)


def build_model(vocab_size, num_classes):
    inp = Input(shape=(MAX_SEQ_LEN,))
    x = Embedding(vocab_size, EMBEDDING_DIM)(inp)
    x = SpatialDropout1D(0.2)(x)
    lstm_out = Bidirectional(LSTM(128, return_sequences=True))(x)
    att_out  = Attention()(lstm_out)
    x = Dropout(0.3)(att_out)
    x = Dense(128, activation="relu")(x)
    x = Dropout(0.2)(x)
    out = Dense(num_classes, activation="softmax")(x)  # softmax สำหรับ class เดียว
    return Model(inp, out)

loaded_model = build_model(VOCAB_SIZE, NUM_CLASSES)
loaded_model.compile(loss="categorical_crossentropy",
                     optimizer=tf.keras.optimizers.Adam(1e-3),
                     metrics=["accuracy"])
loaded_model.load_weights(WEIGHT_PATH)
print(" Weights loaded into new model")

# ---------------------------
# Prediction function
# ---------------------------

POS_KEYWORDS = ["good", "great", "happy", "love", "nice", "excellent", "beautiful"]
CONJUNCTIONS = ["but", "however", "although"]

def predict_with_full_rules(text):
    # 1. Split text into clauses based on conjunctions (on raw text)
    raw_clauses = [text.lower()]
    
    for conj in CONJUNCTIONS:
        temp = []
        for c in raw_clauses:
            temp.extend(c.split(conj))
        raw_clauses = [c.strip() for c in temp if c.strip()]

    clause_preds = []
    for raw_clause in raw_clauses:
        # 2. Clean each individual clause before prediction
        cleaned_clause = clean_text(raw_clause)
        
        # 3. Tokenize and pad the cleaned clause
        seq = pad_sequences(
            loaded_tokenizer.texts_to_sequences([cleaned_clause]),
            maxlen=MAX_SEQ_LEN, padding="post", truncating="post"
        )
        
        # 4. Predict using the model
        pred_probs = loaded_model.predict(seq, verbose=0)[0]
        pred_dict = dict(zip(sentiment_labels, pred_probs))
        pred_label = max(pred_dict, key=pred_dict.get)
        
        # 5. Apply rules on the original (raw) clause
        # Rule: "shit" → neutral
        if raw_clause.startswith("shit") :
            new_string = re.sub("shit", "", raw_clause)
            seq = pad_sequences(
                loaded_tokenizer.texts_to_sequences([new_string]),
                maxlen=MAX_SEQ_LEN, padding="post", truncating="post"
            )
            probs = loaded_model.predict(seq, verbose=0)[0]
            dicts = dict(zip(sentiment_labels, probs))
            label = max(dicts, key=dicts.get)
            if(label != "negative") :
                pred_label = "neutral"
            
        
        clause_preds.append(pred_label)
    
    # 6. Apply final rule based on clause sequence
    # Rule: positive + negative → negative
    final_label = clause_preds[-1] # Default to the last clause's prediction
    for i in range(len(clause_preds)-1):
        if clause_preds[i] == "positive" and clause_preds[i+1] != "negative":
            final_label = "negative"
            break
            
    print(f"\nText: {text}")
    print(f"Predicted (full rules): {final_label}")
    return final_label


# # -----------------------
# # ตัวอย่าง
# # -----------------------
# sample_texts = [
#     "You think you so beautiful but you are not",
#     "you are not",
#     "I love it but the ending was bad",
#     "Shit my pants!",
#     "I am happy",
#     "I will kill",
#     "Although I liked the movie, the ending was disappointing",
#     "Fuck You"
# ]

# for t in sample_texts:
#     predict_with_full_rules(t)
