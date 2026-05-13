import 'package:intl/intl.dart';

class AppDateUtils {
  AppDateUtils._();

  static final _dateFormatter = DateFormat('dd MMM yyyy');
  static final _dateTimeFormatter = DateFormat('dd MMM yyyy, hh:mm a');
  static final _timeFormatter = DateFormat('hh:mm a');
  static final _apiFormatter = DateFormat('yyyy-MM-dd');

  static String formatDate(DateTime date) => _dateFormatter.format(date);
  static String formatDateTime(DateTime date) =>
      _dateTimeFormatter.format(date);
  static String formatTime(DateTime date) => _timeFormatter.format(date);
  static String formatForApi(DateTime date) => _apiFormatter.format(date);

  static DateTime? parseApiDate(String? dateStr) {
    if (dateStr == null) return null;
    try {
      return DateTime.parse(dateStr);
    } catch (_) {
      return null;
    }
  }

  static String timeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);

    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    if (diff.inDays < 30) return '${(diff.inDays / 7).floor()}w ago';
    if (diff.inDays < 365) return '${(diff.inDays / 30).floor()}mo ago';
    return '${(diff.inDays / 365).floor()}y ago';
  }

  static bool isEligibleToDonateSince(DateTime? lastDonation, int minDays) {
    if (lastDonation == null) return true;
    return DateTime.now().difference(lastDonation).inDays >= minDays;
  }

  static DateTime nextEligibleDate(DateTime lastDonation, int minDays) {
    return lastDonation.add(Duration(days: minDays));
  }

  static int ageFromBirthDate(DateTime birthDate) {
    final today = DateTime.now();
    int age = today.year - birthDate.year;
    if (today.month < birthDate.month ||
        (today.month == birthDate.month && today.day < birthDate.day)) {
      age--;
    }
    return age;
  }
}
