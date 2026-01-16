"""
파일명: training/train_emotion_model.py
설명: 실제 TSV 데이터를 활용한 다중 레이블 감정 분석 모델 학습
"""
import os
import torch
import numpy as np
from sklearn.metrics import f1_score, accuracy_score
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    Trainer, 
    TrainingArguments,
    EvalPrediction
)
from datasets import Dataset
from training.load_datasets import EmotionDatasetLoader

# --- 설정 ---
MODEL_NAME = "klue/bert-base" 
OUTPUT_DIR = "./models/weights/kote_emotion_model"
NUM_LABELS = 43
MAX_LENGTH = 128
BATCH_SIZE = 16
EPOCHS = 3
LEARNING_RATE = 2e-5

def compute_metrics(p: EvalPrediction):
    preds = p.predictions[0] if isinstance(p.predictions, tuple) else p.predictions
    sigmoid = torch.nn.Sigmoid()
    probs = sigmoid(torch.Tensor(preds))
    y_pred = np.zeros(probs.shape)
    y_pred[probs >= 0.5] = 1
    y_true = p.label_ids
    
    return {
        'f1': f1_score(y_true=y_true, y_pred=y_pred, average='micro'),
        'accuracy': accuracy_score(y_true, y_pred)
    }

def main():
    # 1. 데이터 로드
    loader = EmotionDatasetLoader(data_dir="data")
    df = loader.load_kote()
    
    # 2. 데이터셋 구성
    # 실제 데이터셋의 'processed_labels' 또는 'labels'를 사용
    label_col = 'processed_labels' if 'processed_labels' in df.columns else 'labels'
    
    train_df = df[df['split'] == 'train']
    val_df = df[df['split'] == 'test'] # 테스트셋을 검증용으로 활용
    
    if len(val_df) == 0: # 테스트 파일이 없으면 학습셋에서 분리
        train_df = train_df.sample(frac=0.9, random_state=42)
        val_df = df.drop(train_df.index)

    train_dataset = Dataset.from_pandas(train_df[['text', label_col]])
    val_dataset = Dataset.from_pandas(val_df[['text', label_col]])
    
    # 컬럼명 통일
    train_dataset = train_dataset.rename_column(label_col, "labels")
    val_dataset = val_dataset.rename_column(label_col, "labels")

    # 3. 토크나이저 및 전처리
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    def preprocess_function(examples):
        tokenized = tokenizer(examples["text"], padding="max_length", truncation=True, max_length=MAX_LENGTH)
        tokenized["labels"] = [[float(l) for l in label] for label in examples["labels"]]
        return tokenized

    train_dataset = train_dataset.map(preprocess_function, batched=True)
    val_dataset = val_dataset.map(preprocess_function, batched=True)
    
    # 4. 모델 초기화
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, 
        num_labels=NUM_LABELS,
        problem_type="multi_label_classification"
    )
    
    # 5. 학습 인자 (실제 학습용 설정)
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        learning_rate=LEARNING_RATE,
        per_device_train_batch_size=BATCH_SIZE,
        num_train_epochs=EPOCHS,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        logging_steps=50,
        fp16=False, # CPU 환경이면 False
    )
    
    # 6. Trainer 초기화
    def data_collator(features):
        batch = tokenizer.pad(features, padding=True, return_tensors="pt")
        batch["labels"] = batch["labels"].float()
        return batch

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        processing_class=tokenizer,
        compute_metrics=compute_metrics,
        data_collator=data_collator,
    )
    
    # 7. 학습 시작
    print(f"🚀 Starting REAL training with {len(train_df)} samples...")
    trainer.train()
    trainer.save_model(OUTPUT_DIR)
    print(f"✅ Model saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
