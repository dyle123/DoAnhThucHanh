import pandas as pd
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.preprocessing import LabelEncoder
import numpy as np


# Đọc file CSV
df = pd.read_csv("cleaned_heart_disease.csv", sep=",")

# Kiểm tra tên cột chính xác
df.columns = df.columns.str.strip()

# Đếm số lần xuất hiện của từng giá trị trong cột Blood Pressure
bp_counts = df["Age"].value_counts()

# Tính tổng số dòng (không tính NaN)
total_count = bp_counts.sum()

# Lấy top 5 giá trị phổ biến nhất kèm phần trăm
top_5_bp_percentage = (bp_counts.tail(5) / total_count) * 100

# Hiển thị kết quả
#print(total_count)
print(top_5_bp_percentage)

# # 1️⃣ Kiểm tra dữ liệu thiếu
print("🔍 Kiểm tra giá trị thiếu:") 
print(df.isnull().sum())

# 2️⃣ Điền giá trị thiếu (nếu có)
df.fillna(df.median(numeric_only=True), inplace=True)  # Điền trung vị cho dữ liệu số
print(df.isnull().sum())

def fill_missing_by_ratio(df, column):
    """Điền giá trị thiếu theo tỷ lệ Yes/No hoặc Male/Female"""
    # Đếm tỷ lệ các giá trị hiện có (bỏ qua NaN)
    counts = df[column].value_counts(normalize=True)

    # Nếu chỉ có 1 giá trị duy nhất, điền toàn bộ giá trị thiếu bằng giá trị đó
    if len(counts) == 1:
        df[column].fillna(counts.index[0], inplace=True)
        return

    # Xác định kiểu dữ liệu cần điền
    if "Yes" in counts.index or "No" in counts.index:
        options = ["Yes", "No"]
        probabilities = [counts.get("Yes", 0), counts.get("No", 0)]
    elif "Male" in counts.index or "Female" in counts.index:
        options = ["Male", "Female"]
        probabilities = [counts.get("Male", 0), counts.get("Female", 0)]
    elif "Low" in counts.index or "Medium" in counts.index or "High" in counts.index:
        options = ["Low", "Medium", "High"]
        probabilities = [counts.get("Low",0), counts.get("Medium",0), counts.get("High",0)]
    else:
        return  # Nếu cột không chứa Yes/No hoặc Male/Female thì bỏ qua

    # Điền giá trị thiếu theo tỷ lệ
    missing_count = df[column].isnull().sum()
    df.loc[df[column].isnull(), column] = np.random.choice(options, size=missing_count, p=probabilities)

# Áp dụng cho các cột cần điền
fill_missing_by_ratio(df, "Smoking")
fill_missing_by_ratio(df, "Family Heart Disease")
fill_missing_by_ratio(df, "Heart Disease Status")
fill_missing_by_ratio(df, "Gender")  # Nếu có cột giới tính
fill_missing_by_ratio(df, "Exercise Habits")  # Nếu có cột giới tính
fill_missing_by_ratio(df, "Alcohol Consumption")  # Nếu có cột giới tính
fill_missing_by_ratio(df, "Stress Level")  # Nếu có cột giới tính


# 5️⃣ Mã hóa dữ liệu dạng chữ thành số
encoder = LabelEncoder()
cat_cols = ["Gender", "Exercise Habits", "Smoking", "Family Heart Disease", "Alcohol Consumption", "Heart Disease Status", "Stress Level"]
for col in cat_cols:
    df[col] = encoder.fit_transform(df[col])

# Lưu dữ liệu đã xử lý
df.to_csv("cleaned_heart_disease1.csv", index=False)

print("\n✅ Tiền xử lý dữ liệu hoàn tất! Dữ liệu đã được lưu vào 'cleaned_heart_disease.csv'.")