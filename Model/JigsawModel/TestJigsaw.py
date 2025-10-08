import os
import re
import pickle
import numpy as np
import tensorflow as tf

from tensorflow.keras.models import Model
from tensorflow.keras.layers import (Input, Embedding, SpatialDropout1D, Conv1D, 
                                     GlobalMaxPooling1D, Bidirectional, LSTM, 
                                     Dense, Dropout, Concatenate, Layer)

from tensorflow.keras.preprocessing.sequence import pad_sequences
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize


os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
tf.get_logger().setLevel('ERROR')


print("Checking NLTK dependencies...")
try:
    nltk.data.find('corpora/wordnet.zip')
    nltk.data.find('corpora/stopwords.zip')
    nltk.data.find('tokenizers/punkt.zip')
    print(" NLTK dependencies are already satisfied.")
except nltk.downloader.DownloadError:
    print(" Downloading NLTK dependencies (punkt, stopwords, wordnet)...")
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    print(" NLTK dependencies downloaded.")


MAX_SEQ_LEN = 200
VOCAB_SIZE = 50000
EMBED_SIZE = 128
LABEL_COLS = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR,  "model_arch.json")
TOKEN_PATH = os.path.join(BASE_DIR,  "tokenizer.pkl")
Weight_PATH = os.path.join(BASE_DIR,  "best_model.weights.h5")
THRESHOLD_PATH = os.path.join(BASE_DIR,  "best_thresholds.pkl")


class Attention(Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    def build(self, input_shape):
        feature_dim = int(input_shape[-1])
        seq_len = int(input_shape[1])
        self.W = self.add_weight(name="att_weight", shape=(feature_dim,1), initializer="glorot_uniform", trainable=True)
        self.b = self.add_weight(name="att_bias", shape=(seq_len,1), initializer="zeros", trainable=True)
        super().build(input_shape)
    def call(self, x):
        import tensorflow.keras.backend as K
        e = K.tanh(K.dot(x, self.W) + self.b)
        a = K.softmax(e, axis=1)
        
        return [K.sum(x * a, axis=1), a]


def build_model():
    inp = Input(shape=(MAX_SEQ_LEN,), name='input_layer')
    x = Embedding(VOCAB_SIZE, EMBED_SIZE)(inp)
    x = SpatialDropout1D(0.2)(x)
    

    lstm_branch = Bidirectional(LSTM(128, return_sequences=True))(x)
    lstm_branch = Bidirectional(LSTM(64, return_sequences=True))(lstm_branch)
    

    attention_output, attention_scores = Attention()(lstm_branch)
    
 
    conv_3 = Conv1D(filters=128, kernel_size=3, activation='relu')(x)
    conv_4 = Conv1D(filters=128, kernel_size=4, activation='relu')(x)
    conv_5 = Conv1D(filters=128, kernel_size=5, activation='relu')(x)
    
    maxpool_3 = GlobalMaxPooling1D()(conv_3)
    maxpool_4 = GlobalMaxPooling1D()(conv_4)
    maxpool_5 = GlobalMaxPooling1D()(conv_5)
    

    merged = Concatenate()([attention_output, maxpool_3, maxpool_4, maxpool_5])
    
    x = Dropout(0.4)(merged)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    outp = Dense(len(LABEL_COLS), activation='sigmoid', name='prediction_output')(x)
    
 
    model = Model(inputs=inp, outputs=[outp, attention_scores])
    return model


stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()
def clean_text(text):
    if not isinstance(text, str): text = str(text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    words = word_tokenize(text)
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words and w.strip()!='']
    return " ".join(words)


def load_prediction_assets(weights_path=Weight_PATH,
                           tokenizer_path=TOKEN_PATH, 
                           thresholds_path=THRESHOLD_PATH):
    print("\n--- Building model and loading assets ---")
    try:
        model = build_model()
        print(" Model structure built successfully.")
        
        model.load_weights(weights_path)
        print(" Model weights loaded successfully.")
        
        with open(tokenizer_path, 'rb') as f:
            tokenizer = pickle.load(f)
        print(" Tokenizer loaded successfully.")

        with open(thresholds_path, 'rb') as f:
            thresholds = pickle.load(f)
        print(" Thresholds loaded successfully.")
        
        return model, tokenizer, thresholds

    except FileNotFoundError as e:
        print(f" Error: Could not find a required file -> {e.filename}")
        return None, None, None
    except Exception as e:
        print(f" An unexpected error occurred: {e}")
        return None, None, None


def predict_and_explain(texts, model, tokenizer, thresholds):
    if not isinstance(texts, list): texts = [texts]
    
    cleaned_texts = [clean_text(t) for t in texts]
    sequences = tokenizer.texts_to_sequences(cleaned_texts)
    X = pad_sequences(sequences, maxlen=MAX_SEQ_LEN)
    
  
    pred_probs, attention_weights = model.predict(X)

  
    index_to_word = {v: k for k, v in tokenizer.word_index.items()}
    
    results = []
    for i, text in enumerate(texts):
       
        probabilities = {LABEL_COLS[j]: float(pred_probs[i][j]) for j in range(len(LABEL_COLS))}
        prediction = {LABEL_COLS[j]: int(pred_probs[i][j] > thresholds[j]) for j in range(len(LABEL_COLS))}
        
     
        explanation = []
       
        original_seq_len = len(sequences[i])
        
       
        for j in range(original_seq_len):
            word_index = sequences[i][j]
            word = index_to_word.get(word_index, "[UNK]") 
            score = float(attention_weights[i][j][0])
            explanation.append((word, score))
            
       
        explanation.sort(key=lambda x: x[1], reverse=True)

        results.append({
            "text": text, 
            "prediction": prediction, 
            "probabilities": probabilities,
            "explanation": explanation
        })
    return results
    

if __name__ == "__main__":
    model, tokenizer, thresholds = load_prediction_assets()
    
    if model and tokenizer and thresholds:
        sample_texts_to_predict = [
            "This is a fantastic piece of work, congratulations!",
            "You are a stupid idiot, I will find you and hurt you.",
            "go away you moron",
            "I love this community, everyone is so helpful.",
            "Fuck you and your mother you piece of shit."
        ]
        
        print("\n--- Starting Prediction and Explanation ---")
        predictions = predict_and_explain(sample_texts_to_predict, model, tokenizer, thresholds)
        
    
        for result in predictions:
            print("\n" + "="*50)
            print(f"Input Text: \"{result['text']}\"")
            print("-"*50)
            
            print("Predicted Labels:")
            active_labels = [label for label, value in result['prediction'].items() if value == 1]
            
            if active_labels:
                for label in active_labels:
                    print(f"  - {label.upper()} (Prob: {result['probabilities'][label]:.4f})")
                
                print("\n  Explanation (Top 3 words the model focused on):")
                
                for word, score in result['explanation'][:3]:
                    print(f"    - '{word}' (Attention Score: {score:.4f})")

            else:
                print("  - (None)")
            print("="*50)