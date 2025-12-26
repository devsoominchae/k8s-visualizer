# log_controller.py

import json

from utils.utils import format_timestamp

class LogController:
    def __init__(self, log_text, requested_items=['timeStamp', 'level', 'message'], requested_level="info"):
        if log_text == None:
            raise ValueError("Log text cannot be None")
        else:
            self.log_text = log_text
            self.requested_level = requested_level
            self.requested_items = requested_items
            self.log_output_order = {
                "timeStamp": 1,
                "level": 2,
                "message": 3,
                "messageKey": 4,
                "messageParameters": 5,
                "properties": 6,
                "source": 7,
                "version": 8
            }
            
            self.logger_precedence = {
                'TRACE': 1,
                'DEBUG': 2,
                'INFO': 3,
                'WARN': 4,
                'ERROR': 5,
                'FATAL': 6
            }
    
    def parse_log(self):
        parsed_logs = []
        for line in self.log_text.split('\n'):
            if line:
                try:
                    line_json = json.loads(line)
                    if self.logger_precedence[line_json['level'].upper()] >= self.logger_precedence[self.requested_level.upper()]:   
                        self.available_items = list(line_json.keys())
                        log_key = list(set(self.available_items) & set(self.requested_items))
                        log_key.sort(key=lambda x: self.log_output_order.get(x, 99))
                        line_json['level'] = line_json['level'].upper()
                        line_json['timeStamp'] = format_timestamp(line_json['timeStamp'])
                        selected_log_objects = {key: line_json[key] for key in log_key if key in line_json}
                        parsed_logs.append(selected_log_objects)
                
                except Exception as e:
                    print(f"Error occurred in LogController > parse_log : {e}")
                    parsed_logs.append(line)
            
        return parsed_logs