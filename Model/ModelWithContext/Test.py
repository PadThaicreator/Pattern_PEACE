import pickle
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import Layer, Input, Embedding, SpatialDropout1D, Conv1D, GlobalMaxPooling1D, Bidirectional, LSTM, Dense, Dropout, Concatenate
from tensorflow.keras.models import Model


BASE_DIR = os.path.dirname(__file__)  
MODEL_PATH = os.path.join(BASE_DIR,  "model_weights.weights.h5")
TOKEN_PATH = os.path.join(BASE_DIR, "tokenizer.pkl")
MAX_SEQ_LEN = 200
label_cols = ['toxic','severe_toxic','obscene','threat','insult','identity_hate']

# ---------------------------
# Attention Layer
# ---------------------------
import tensorflow.keras.backend as K
class Attention(Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def build(self, input_shape):
        feature_dim = int(input_shape[-1])
        seq_len = int(input_shape[1])
        self.W = self.add_weight(name="att_weight", shape=(feature_dim,1),
                                 initializer="glorot_uniform", trainable=True)
        self.b = self.add_weight(name="att_bias", shape=(seq_len,1),
                                 initializer="zeros", trainable=True)
        super().build(input_shape)

    def call(self, x):
        e = K.tanh(K.dot(x, self.W) + self.b)
        a = K.softmax(e, axis=1)
        return K.sum(x * a, axis=1)

# ---------------------------
# Build model (เหมือนตอน train)
def build_model(actual_vocab_size=50000, embed_dim=128):
    inp = Input(shape=(MAX_SEQ_LEN,))
    x = Embedding(input_dim=actual_vocab_size, output_dim=embed_dim)(inp)
    x = SpatialDropout1D(0.2)(x)
    lstm_out = Bidirectional(LSTM(128, return_sequences=True))(x)
    att_out = Attention()(lstm_out)
    convs = []
    for k in [3,4,5]:
        c = Conv1D(64, k, activation='relu')(x)
        c = GlobalMaxPooling1D()(c)
        convs.append(c)
    conv_out = Concatenate()(convs)
    merged = Concatenate()([att_out, conv_out])
    merged = Dropout(0.3)(merged)
    dense = Dense(128, activation='relu')(merged)
    dense = Dropout(0.2)(dense)
    out = Dense(len(label_cols), activation='sigmoid')(dense)
    return Model(inp, out)

# ---------------------------
# Load tokenizer
with open(TOKEN_PATH, "rb") as f:
    tokenizer = pickle.load(f)

actual_vocab_size = min(50000, len(tokenizer.word_index)+1)

# ---------------------------
# Load model weights
loaded_model = build_model(actual_vocab_size=actual_vocab_size)
loaded_model.load_weights(MODEL_PATH)

loaded_model.compile(loss='binary_crossentropy',
                     optimizer='adam',
                     metrics=['accuracy', tf.keras.metrics.AUC(name='AUC')])

# ---------------------------
# Prediction function
def predict_texts(texts):
    seqs = tokenizer.texts_to_sequences(texts)
    X = pad_sequences(seqs, maxlen=MAX_SEQ_LEN)
    preds = loaded_model.predict(X)
    for t, p in zip(texts, preds):

        return dict(zip(label_cols, [round(float(x),4) for x in p]))
        # print("\nText:", t)
        # print("Pred:", dict(zip(label_cols, [round(float(x),4) for x in p])))

# ---------------------------
# Test example
# sample_texts = ["You are so fucking beautiful, I can’t believe it." , "You think you’re so fucking beautiful, but you’re not." , "You're so dumb, I can’t believe you wrote that." , "Every word you say makes you look like the most pathetic human alive." , "You’re nothing but trash, the world would be better without you."]
# predict_texts(sample_texts)
