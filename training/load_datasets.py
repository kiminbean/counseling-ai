"""
파일명: training/load_datasets.py
저장 경로: /counseling-ai/training/load_datasets.py
"""
import pandas as pd
import numpy as np
import os

class EmotionDatasetLoader:
    """
    실제 TSV 파일을 로드하는 데이터 로더
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.datasets = {}
    
    def load_kote(self) -> pd.DataFrame:
        """
        로컬 TSV 파일에서 KOTE 데이터셋 로드
        기대하는 파일: data/train.tsv, data/test.tsv
        """
        train_path = os.path.join(self.data_dir, "train.tsv")
        test_path = os.path.join(self.data_dir, "test.tsv")
        
        all_dfs = []
        
        # 1. Train 데이터 로드
        if os.path.exists(train_path):
            print(f"Loading real training data from {train_path}...")
            # 헤더가 없는 경우 대비 (ID, Text, Labels 순서 가정)
            df_train = pd.read_csv(train_path, sep='\t', header=None, names=['id', 'text', 'labels'])
            df_train['split'] = 'train'
            all_dfs.append(df_train)
        else:
            print(f"⚠️ Warning: {train_path} not found.")

        # 2. Test 데이터 로드
        if os.path.exists(test_path):
            print(f"Loading real test data from {test_path}...")
            df_test = pd.read_csv(test_path, sep='\t', header=None, names=['id', 'text', 'labels'])
            df_test['split'] = 'test'
            # Validation 용도로 일부 사용하기 위해 split 설정
            all_dfs.append(df_test)
        
        if not all_dfs:
            print("🚨 No real data found! Switching to Mock data mode.")
            return self._generate_mock_data()

        df = pd.concat(all_dfs, ignore_index=True)
        
        # 3. 라벨 전처리 (KOTE 형식 대응)
        # KOTE 데이터셋은 보통 43개 컬럼이 0/1로 있거나, 'labels' 컬럼에 [1, 5] 식으로 들어있음
        if 'labels' in df.columns:
            # 문자열 형태의 리스트 "[0, 1]"를 실제 리스트로 변환 및 Multi-hot 인코딩
            df['processed_labels'] = df['labels'].apply(self._convert_to_multi_hot)
        else:
            # 만약 컬럼 자체가 43개라면 (KOTE 원본 형태 중 하나)
            # 여기서는 'labels' 컬럼이 있는 표준 포맷을 가정합니다.
            pass

        print(f"✅ Successfully loaded {len(df)} samples from TSV files.")
        return df

    def _convert_to_multi_hot(self, label_str):
        """문자열 라벨을 43차원 multi-hot 벡터로 변환"""
        labels = [0] * 43
        try:
            # "0, 1, 5" 또는 "[0, 1, 5]" 형태 처리
            if isinstance(label_str, str):
                cleaned = label_str.replace('[', '').replace(']', '').replace(' ', '')
                if cleaned:
                    for idx in map(int, cleaned.split(',')):
                        if 0 <= idx < 43:
                            labels[idx] = 1
            elif isinstance(label_str, list):
                for idx in label_str:
                    labels[idx] = 1
        except:
            pass
        return labels

    def _generate_mock_data(self) -> pd.DataFrame:
        """데이터 파일이 없을 때를 위한 비상용 데이터 생성"""
        texts = ["테스트 문장입니다."] * 10
        data = [{"text": t, "labels": [0]*43, "split": "train"} for t in texts]
        return pd.DataFrame(data)
