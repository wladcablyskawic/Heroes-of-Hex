// Generated by CoffeeScript 1.10.0
define(['external/underscore', 'modules/core/types', 'modules/clean/ajax', 'modules/clean/activity/activity', 'modules/clean/activity/activity_user', 'modules/clean/promise'], function($u, arg, ajax, Activity, ActivityUser, arg1) {
  var ADD_COMMENT_OPTIONS_TYPE, DELETE_COMMENT_OPTIONS_TYPE, Either, FETCH_FILE_ACTIVITIES_OPTIONS_TYPE, FETCH_FILE_ACTIVITY_OPTIONS_TYPE, MARK_COMMENT_AS_SEEN_OPTIONS_TYPE, Maybe, Promise, SUBMIT_PRODUCT_FEEDBACK_OPTIONS_TYPE, UPDATE_COMMENT_SETTING_OPTIONS_TYPE, UPDATE_LIKE_COMMENT_OPTIONS_TYPE, UPDATE_RESOLVED_OPTIONS_TYPE, UPDATE_SUBSCRIPTION_OPTIONS_TYPE, _API_COMMON_PARAM_TYPES, _buildFileActivityFromDict, _extractActivityPayload, _extractActivityPayloadAndBoltData, _fetchRawActivityWithBoltData, _makeRequest, addComment, deleteComment, fetchFileActivities, fetchFileActivity, fetchFileActivityWithBoltData, markCommentsSeen, returns, sawCommentOnboarding, submitProductFeedback, takes, updateCommentSetting, updateFileActivitySubscription, updateLikeComment, updateResolveComment;
  takes = arg.takes, returns = arg.returns, Maybe = arg.Maybe, Either = arg.Either;
  Promise = arg1.Promise;
  _API_COMMON_PARAM_TYPES = {
    actorId: Maybe(Number),
    oref: Maybe(String),
    isBackgroundRequest: Maybe(Boolean)
  };
  _makeRequest = function(arg2) {
    var actorId, data, isBackgroundRequest, oref, promise, request, type, url;
    url = arg2.url, type = arg2.type, data = arg2.data, actorId = arg2.actorId, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    request = isBackgroundRequest ? ajax.SilentBackgroundRequestOref : ajax.WebRequestOref;
    promise = new Promise(function(resolve, reject) {
      return request({
        url: url,
        type: type,
        data: $u.extend({
          oref: oref
        }, data),
        subject_user: actorId,
        success: resolve,
        error: reject
      });
    });
    return promise.then(JSON.parse);
  };
  _extractActivityPayload = function(resp) {
    var error, errorText, ref;
    if (resp.status === 'error') {
      errorText = (ref = resp.payload) != null ? ref.error_text : void 0;
      error = Error(errorText);
      error.payload = resp.payload;
      error.error_text = errorText;
      throw error;
    } else {
      return resp.payload;
    }
  };
  _extractActivityPayloadAndBoltData = function(resp) {
    var boltData, payload;
    payload = _extractActivityPayload(resp);
    boltData = resp.bolt_data;
    return [payload, boltData];
  };
  _buildFileActivityFromDict = function(activityDict) {
    return new Activity.FileActivity(activityDict);
  };
  ADD_COMMENT_OPTIONS_TYPE = $u.extend({
    targetActivity: Either(Activity.FileActivity, Activity.CommentActivity),
    context: Number,
    contextData: String,
    text: String,
    metadata: Maybe(Object)
  }, _API_COMMON_PARAM_TYPES);
  addComment = takes(ADD_COMMENT_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, context, contextData, data, isBackgroundRequest, metadata, oref, targetActivity, text;
    actorId = arg2.actorId, targetActivity = arg2.targetActivity, context = arg2.context, contextData = arg2.contextData, text = arg2.text, metadata = arg2.metadata, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    data = {
      activity_context: context,
      activity_context_data: contextData,
      comment_text: text,
      comment_metadata_json: metadata != null ? JSON.stringify(metadata) : null
    };
    if (targetActivity instanceof Activity.CommentActivity) {
      data.target_comment_activity_key = targetActivity.activity_key;
    }
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/comment',
      type: 'POST',
      data: data,
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(_extractActivityPayload);
  }));
  sawCommentOnboarding = takes(Number, returns(Promise, function(actorId) {
    var sawOnboardingPromise;
    sawOnboardingPromise = new Promise(function(resolve, reject) {
      return ajax.SilentBackgroundRequestOref({
        url: '/file_activity/has_seen_comments_onboarding',
        type: 'POST',
        success: resolve,
        error: reject,
        subject_user: actorId
      });
    });
    return sawOnboardingPromise.then(JSON.parse).then(_extractActivityPayload);
  }));
  DELETE_COMMENT_OPTIONS_TYPE = $u.extend({
    commentActivityKey: String,
    context: Number,
    contextData: String
  }, _API_COMMON_PARAM_TYPES);
  deleteComment = takes(DELETE_COMMENT_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, commentActivityKey, context, contextData, isBackgroundRequest, oref;
    actorId = arg2.actorId, commentActivityKey = arg2.commentActivityKey, context = arg2.context, contextData = arg2.contextData, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/comment/delete',
      type: 'POST',
      data: {
        comment_key: commentActivityKey,
        activity_context: context,
        activity_context_data: contextData
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(_extractActivityPayload);
  }));
  UPDATE_LIKE_COMMENT_OPTIONS_TYPE = $u.extend({
    liked: Boolean,
    commentActivityKey: String,
    context: Number,
    contextData: String
  }, _API_COMMON_PARAM_TYPES);
  updateLikeComment = takes(UPDATE_LIKE_COMMENT_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, commentActivityKey, context, contextData, isBackgroundRequest, liked, oref;
    actorId = arg2.actorId, liked = arg2.liked, commentActivityKey = arg2.commentActivityKey, context = arg2.context, contextData = arg2.contextData, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/like',
      type: 'POST',
      data: {
        activity_key: commentActivityKey,
        activity_context: context,
        activity_context_data: contextData,
        liked: liked
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(_extractActivityPayload);
  }));
  UPDATE_COMMENT_SETTING_OPTIONS_TYPE = $u.extend({
    enableComment: Boolean,
    context: Number,
    contextData: String
  }, _API_COMMON_PARAM_TYPES);
  updateCommentSetting = takes(UPDATE_COMMENT_SETTING_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, context, contextData, enableComment, isBackgroundRequest, oref;
    actorId = arg2.actorId, enableComment = arg2.enableComment, context = arg2.context, contextData = arg2.contextData, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/feedback_setting',
      type: 'POST',
      data: {
        activity_context: context,
        activity_context_data: contextData,
        feedback_off: !enableComment
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(_extractActivityPayload);
  }));
  UPDATE_RESOLVED_OPTIONS_TYPE = $u.extend({
    resolved: Boolean,
    commentActivityKey: String,
    context: Number,
    contextData: String
  });
  updateResolveComment = takes(UPDATE_RESOLVED_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, commentActivityKey, context, contextData, isBackgroundRequest, oref, resolved;
    actorId = arg2.actorId, resolved = arg2.resolved, commentActivityKey = arg2.commentActivityKey, context = arg2.context, contextData = arg2.contextData, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/comment/resolve',
      type: 'POST',
      data: {
        activity_key: commentActivityKey,
        activity_context: context,
        activity_context_data: contextData,
        resolved: resolved
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(_extractActivityPayload);
  }));
  MARK_COMMENT_AS_SEEN_OPTIONS_TYPE = $u.extend({
    commentActivityKey: String,
    context: Number,
    contextData: String
  });
  markCommentsSeen = takes(MARK_COMMENT_AS_SEEN_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, commentActivityKey, context, contextData, isBackgroundRequest, oref;
    actorId = arg2.actorId, commentActivityKey = arg2.commentActivityKey, context = arg2.context, contextData = arg2.contextData, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/mark_comments_seen',
      type: 'POST',
      data: {
        last_seen_comment_key: commentActivityKey,
        activity_context: context,
        activity_context_data: contextData
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(_extractActivityPayload);
  }));
  FETCH_FILE_ACTIVITY_OPTIONS_TYPE = $u.extend({
    context: Number,
    contextData: String
  }, _API_COMMON_PARAM_TYPES);
  _fetchRawActivityWithBoltData = function(arg2) {
    var actorId, context, contextData, isBackgroundRequest, oref;
    actorId = arg2.actorId, context = arg2.context, contextData = arg2.contextData, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/file_activity',
      type: 'GET',
      data: {
        activity_context: context,
        activity_context_data: contextData,
        activity_type: Activity.ActivityType.FILE
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    });
  };
  fetchFileActivity = takes(FETCH_FILE_ACTIVITY_OPTIONS_TYPE, returns(Promise, function(options) {
    return _fetchRawActivityWithBoltData(options).then(_extractActivityPayload).then(_buildFileActivityFromDict);
  }));
  fetchFileActivityWithBoltData = takes(FETCH_FILE_ACTIVITY_OPTIONS_TYPE, returns(Promise, function(options) {
    return _fetchRawActivityWithBoltData(options).then(_extractActivityPayloadAndBoltData).then(function(arg2) {
      var activityDict, boltData;
      activityDict = arg2[0], boltData = arg2[1];
      return [_buildFileActivityFromDict(activityDict), boltData];
    });
  }));
  FETCH_FILE_ACTIVITIES_OPTIONS_TYPE = $u.extend({
    context: Number,
    contextDataList: Array
  }, _API_COMMON_PARAM_TYPES);
  fetchFileActivities = takes(FETCH_FILE_ACTIVITIES_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, context, contextDataList, isBackgroundRequest, oref;
    actorId = arg2.actorId, context = arg2.context, contextDataList = arg2.contextDataList, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/file_activity_batch',
      type: 'GET',
      data: {
        activity_context: context,
        activity_context_data_batch: JSON.stringify(contextDataList),
        activity_type: Activity.ActivityType.FILE
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(function(activityDictByContext) {
      return $u.mapObject(activityDictByContext, _buildFileActivityFromDict);
    });
  }));
  UPDATE_SUBSCRIPTION_OPTIONS_TYPE = $u.extend({
    targetUserEmail: String,
    subscribed: Boolean,
    context: Number,
    contextData: String
  }, _API_COMMON_PARAM_TYPES);
  updateFileActivitySubscription = takes(UPDATE_SUBSCRIPTION_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, context, contextData, isBackgroundRequest, oref, subscribed, targetUserEmail;
    actorId = arg2.actorId, targetUserEmail = arg2.targetUserEmail, subscribed = arg2.subscribed, context = arg2.context, contextData = arg2.contextData, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/subscribe',
      type: 'POST',
      data: {
        activity_context: context,
        activity_context_data: contextData,
        subscribed: subscribed,
        target_user_identifier: targetUserEmail
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(_extractActivityPayload);
  }));
  SUBMIT_PRODUCT_FEEDBACK_OPTIONS_TYPE = $u.extend({
    feedbackText: String,
    context: Number,
    contextData: String
  });
  submitProductFeedback = takes(SUBMIT_PRODUCT_FEEDBACK_OPTIONS_TYPE, returns(Promise, function(arg2) {
    var actorId, context, contextData, feedbackText, isBackgroundRequest, oref;
    actorId = arg2.actorId, feedbackText = arg2.feedbackText, context = arg2.context, contextData = arg2.contextData, oref = arg2.oref, isBackgroundRequest = arg2.isBackgroundRequest;
    return _makeRequest({
      actorId: actorId,
      url: '/file_activity/product_feedback',
      type: 'POST',
      data: {
        activity_context: context,
        activity_context_data: contextData,
        feedback_text: feedbackText
      },
      oref: oref,
      isBackgroundRequest: isBackgroundRequest
    }).then(_extractActivityPayload);
  }));
  return {
    sawCommentOnboarding: sawCommentOnboarding,
    addComment: addComment,
    deleteComment: deleteComment,
    updateLikeComment: updateLikeComment,
    updateResolveComment: updateResolveComment,
    updateCommentSetting: updateCommentSetting,
    markCommentsSeen: markCommentsSeen,
    fetchFileActivity: fetchFileActivity,
    fetchFileActivityWithBoltData: fetchFileActivityWithBoltData,
    fetchFileActivities: fetchFileActivities,
    updateFileActivitySubscription: updateFileActivitySubscription,
    submitProductFeedback: submitProductFeedback
  };
});

//# sourceMappingURL=api.js.map