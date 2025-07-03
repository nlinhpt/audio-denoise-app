import numpy as np
import soundfile as sf
from scipy.signal import butter, filtfilt, fftconvolve

def filter_combined(input_file, output_file, freq_range, start_time, end_time, threshold=0.4, kernel_size=50, kernel_width=2.0):
    # Load audio file
    signal, sr = sf.read(input_file)
    if len(signal.shape) > 1:  # Convert to mono if stereo
        signal = np.mean(signal, axis=1)

    # Convert time range to sample range
    start_sample = int(start_time * sr)
    end_sample = int(end_time * sr)

    # Step 1: Apply threshold to specific time range
    segment = signal[start_sample:end_sample]
    segment[segment > threshold] = threshold
    segment[segment < -threshold] = -threshold

    # Step 2: Apply Band-Stop Filter
    low_freq, high_freq = freq_range
    nyquist = sr / 2
    low = low_freq / nyquist
    high = high_freq / nyquist
    b, a = butter(N=2, Wn=[low, high], btype='bandstop')
    filtered_segment = filtfilt(b, a, segment)

    # Replace the original segment with the filtered segment
    signal[start_sample:end_sample] = filtered_segment

    # Step 3: Apply Gaussian smoothing
    kernel = np.exp(-np.linspace(-kernel_width, kernel_width, kernel_size)**2)
    kernel = kernel / np.sum(kernel)
    smoothed_signal = fftconvolve(signal, kernel, mode='same')

    # Normalize and save
    smoothed_signal = smoothed_signal / np.max(np.abs(smoothed_signal))
    sf.write(output_file, smoothed_signal, sr)
    return sr