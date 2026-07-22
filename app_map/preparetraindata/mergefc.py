import os
import pandas as pd

def merge_csv_files_vertically(folder_path, output_filename='merged_sampled_data.csv', add_source_column=False):
    """
    Merges all CSV files in the specified folder vertically (i.e., row by row).

    Parameters:
        folder_path (str): Path to the folder containing CSV files.
        output_filename (str): Name of the output merged CSV file.
        add_source_column (bool): If True, adds a 'source_file' column indicating the origin file for each row.

    Returns:
        str: Path to the saved merged CSV file.
    """
    csv_files = [f for f in os.listdir(folder_path) if f.endswith('.csv')]

    if not csv_files:
        print("❌ No CSV files found in the folder.")
        return None

    dataframes = []
    for file in csv_files:
        file_path = os.path.join(folder_path, file)
        try:
            df = pd.read_csv(file_path)
            if df.empty:
                print(f"⚠️ Skipping empty file: {file}")
                continue
            if add_source_column:
                df['source_file'] = file
            dataframes.append(df)
        except pd.errors.EmptyDataError:
            print(f"⚠️ Skipping completely empty file: {file}")
            continue

    if not dataframes:
        print("❌ All files were empty or unreadable.")
        return None

    merged_df = pd.concat(dataframes, ignore_index=True)
    output_path = os.path.join(folder_path, output_filename)
    merged_df.to_csv(output_path, index=False)

    print(f"✅ Merged {len(dataframes)} files successfully. Output saved to: {output_path}")
    return output_path

merge_csv_files_vertically(
    folder_path=r'D:\Mohammad\sampledata',
    output_filename=r'D:\Mohammad\sampledata\merged_all_samples.csv',
    add_source_column=True
)