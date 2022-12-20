tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_node_names='KanjiRecognition/Predictions/Reshape_1' \
    --saved_model_tags=serve \
    ./kanji_saved_model \
    ./kanji_web_model

#tensorflowjs_converter \
#    --input_format=keras \
#    ./kanji_model_ok.h5 \
#    ./kanji_web_model
