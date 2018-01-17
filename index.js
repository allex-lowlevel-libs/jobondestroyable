function createJobOnDestroyable (inherit, JobBase, Error, qreject) {
  'use strict';
  function JobOnDestroyableBase (destroyable, defer) {
    JobBase.call(this, defer);
    this.destroyable = destroyable;
  }
  inherit(JobOnDestroyableBase, JobBase);
  JobOnDestroyableBase.prototype.destroy = function () {
    this.destroyable = null;
    JobBase.prototype.destroy.call(this);
  };
  JobOnDestroyableBase.prototype.okToGo = function () {
    var ret = {ok: true, val: null};
    if (!this.defer) {
      ret.ok = false;
      ret.val = qreject(new Error('ALREADY_DESTROYED'));
      return ret;
    }
    ret.val = this.defer.promise;
    if (!this.okToProceed()) {
      ret.ok = false;
    }
    return ret;
  };
  JobOnDestroyableBase.prototype.peekToProceed = function () {
    var ret = {ok: true, val: null};
    if (!(this.destroyable && this.defer)) {
      ret.ok = false;
      ret.val = new Error('ALREADY_DESTROYED');
      return ret;
    }
    if (!this._destroyableOk()) {
      ret.ok = false;
      ret.val = new Error('DESTROYABLE_REFERENCE_DESTROYED');
      return ret;
    }
    ret.val = this.defer.promise;
    return ret;
  };
  JobOnDestroyableBase.prototype.okToProceed = function () {
    var ptp = this.peekToProceed();
    if (!ptp.ok) {
      this.reject(ptp.val);
    }
    return ptp.ok;
  };

  function JobOnDestroyable (destroyable, defer) {
    JobOnDestroyableBase.call(this, destroyable, defer);
  }
  inherit(JobOnDestroyable, JobOnDestroyableBase);
  JobOnDestroyable.prototype._destroyableOk = function () {
    return this.destroyable && this.destroyable.destroyed;
  };

  function JobOnComplexDestroyable (destroyable, defer) {
    JobOnDestroyableBase.call(this, destroyable, defer);
  }
  inherit(JobOnComplexDestroyable, JobOnDestroyableBase);
  JobOnComplexDestroyable.prototype._destroyableOk = function () {
    return this.destroyable && this.destroyable.aboutToDie;
  };

  return {
    JobOnDestroyableBase: JobOnDestroyableBase,
    JobOnDestroyable: JobOnDestroyable,
    JobOnComplexDestroyable: JobOnComplexDestroyable
  };
}

module.exports = createJobOnDestroyable;
