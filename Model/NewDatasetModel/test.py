import pickle
import numpy as np
import tensorflow as tf
import os
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, SpatialDropout1D, Bidirectional, LSTM, Dense, Dropout, Layer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import tensorflow.keras.backend as K
from datasets import load_dataset
import sys
sys.stdout.reconfigure(encoding='utf-8')

# ---------------- Parameters ----------------
MAX_NUM_WORDS = 20000
MAX_SEQ_LEN = 200
EMBEDDING_DIM = 128

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR,  "goemotions_bilstm_attention.weights.h5")
TOKEN_PATH = os.path.join(BASE_DIR,  "tokenizer.pkl")

# ---------------- Load dataset for labels ----------------
dataset = load_dataset("go_emotions")
num_classes = len(dataset["train"].features["labels"].feature.names)

# ---------------- Attention Layer ----------------
class Attention(Layer):
    def build(self, input_shape):
        self.W = self.add_weight(name="att_weight", shape=(input_shape[-1],1),
                                 initializer="glorot_uniform", trainable=True)
        self.b = self.add_weight(name="att_bias", shape=(input_shape[1],1),
                                 initializer="zeros", trainable=True)
        super().build(input_shape)

    def call(self, x):
        e = K.tanh(K.dot(x, self.W) + self.b)
        a = K.softmax(e, axis=1)
        return K.sum(x * a, axis=1)

# ---------------- Build model ----------------
def build_model(vocab_size, num_classes):
    inp = Input(shape=(MAX_SEQ_LEN,))
    x = Embedding(vocab_size, EMBEDDING_DIM)(inp)
    x = SpatialDropout1D(0.2)(x)
    lstm_out = Bidirectional(LSTM(128, return_sequences=True))(x)
    att_out = Attention()(lstm_out)
    x = Dropout(0.3)(att_out)
    x = Dense(128, activation="relu")(x)
    x = Dropout(0.2)(x)
    out = Dense(num_classes, activation="sigmoid")(x)
    return Model(inp, out)

vocab_size = MAX_NUM_WORDS  # or same as training
model = build_model(vocab_size, num_classes)

# ---------------- Load weights ----------------
model.load_weights(MODEL_PATH)
print("✅ Weights loaded")

# ---------------- Load tokenizer ----------------
with open(TOKEN_PATH, "rb") as f:
    tokenizer = pickle.load(f)

# ---------------- Predict ----------------
def predict_texts(texts):
    seqs = pad_sequences(tokenizer.texts_to_sequences(texts),
                         maxlen=MAX_SEQ_LEN, padding="post", truncating="post")
    preds = model.predict(seqs)
    for t, p in zip(texts, preds):
        res = dict(zip(dataset["train"].features["labels"].feature.names,[round(float(x),4) for x in p]))
        # print("\nText:", t)
        # print("Pred:", res)
        return res

# Example
# sample_texts = ["You are so fucking beautiful, I can’t believe it." , "You think you’re so fucking beautiful, but you’re not."]
# predict_texts(sample_texts)
