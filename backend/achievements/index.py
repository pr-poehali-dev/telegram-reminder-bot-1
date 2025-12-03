import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    '''
    Создает подключение к базе данных PostgreSQL
    Returns: соединение с БД
    '''
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления достижениями пользователей
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с достижениями пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            query = '''
                SELECT 
                    a.id,
                    a.title,
                    a.description,
                    a.icon,
                    a.required_count,
                    COALESCE(ua.progress, 0) as progress,
                    COALESCE(ua.unlocked, false) as unlocked,
                    ua.unlocked_at
                FROM achievements a
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = %s
                ORDER BY a.id
            '''
            cursor.execute(query, (user_id,))
            achievements = cursor.fetchall()
            
            achievements_list = []
            for achievement in achievements:
                progress_percent = min(100, int((achievement['progress'] / achievement['required_count']) * 100))
                achievements_list.append({
                    'id': str(achievement['id']),
                    'title': achievement['title'],
                    'description': achievement['description'],
                    'icon': achievement['icon'],
                    'progress': progress_percent,
                    'unlocked': achievement['unlocked'],
                    'unlockedAt': achievement['unlocked_at'].isoformat() if achievement['unlocked_at'] else None
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'achievements': achievements_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            user_id = body_data.get('user_id')
            achievement_id = body_data.get('achievement_id')
            progress_increment = body_data.get('progress_increment', 1)
            
            if not user_id or not achievement_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id and achievement_id are required'}),
                    'isBase64Encoded': False
                }
            
            query_achievement = 'SELECT required_count FROM achievements WHERE id = %s'
            cursor.execute(query_achievement, (achievement_id,))
            achievement = cursor.fetchone()
            
            if not achievement:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Achievement not found'}),
                    'isBase64Encoded': False
                }
            
            required_count = achievement['required_count']
            
            query = '''
                INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked, unlocked_at)
                VALUES (%s, %s, %s, 
                    CASE WHEN %s >= %s THEN true ELSE false END,
                    CASE WHEN %s >= %s THEN CURRENT_TIMESTAMP ELSE NULL END)
                ON CONFLICT (user_id, achievement_id) 
                DO UPDATE SET 
                    progress = user_achievements.progress + %s,
                    unlocked = CASE WHEN user_achievements.progress + %s >= %s THEN true ELSE user_achievements.unlocked END,
                    unlocked_at = CASE WHEN user_achievements.progress + %s >= %s AND user_achievements.unlocked_at IS NULL 
                                  THEN CURRENT_TIMESTAMP ELSE user_achievements.unlocked_at END
                RETURNING progress, unlocked
            '''
            cursor.execute(query, (
                user_id, achievement_id, progress_increment,
                progress_increment, required_count,
                progress_increment, required_count,
                progress_increment, progress_increment, required_count,
                progress_increment, required_count
            ))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'progress': result['progress'],
                    'unlocked': result['unlocked']
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
